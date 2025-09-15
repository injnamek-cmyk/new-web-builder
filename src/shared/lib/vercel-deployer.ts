export interface VercelDeploymentConfig {
  projectName: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  environment?: Record<string, string>;
  domain?: string;
}

export interface VercelDeploymentResult {
  success: boolean;
  deploymentId?: string;
  url?: string;
  alias?: string;
  logs: string[];
  error?: string;
}

export class VercelDeployer {
  private apiToken: string;
  private teamId?: string;

  constructor(apiToken: string, teamId?: string) {
    this.apiToken = apiToken;
    this.teamId = teamId;
  }

  // 메인 배포 함수
  async deploy(config: VercelDeploymentConfig): Promise<VercelDeploymentResult> {
    const logs: string[] = [];

    try {
      logs.push("🚀 Starting deployment to Vercel...");

      // 1. 파일 업로드 준비
      logs.push("📁 Preparing files for upload...");
      const files = this.prepareFiles(config.files);

      // 2. 배포 생성
      logs.push("⚡ Creating deployment...");
      const deployment = await this.createDeployment({
        name: config.projectName,
        files,
        env: config.environment,
      });

      logs.push(`✅ Deployment created: ${deployment.id}`);

      // 3. 배포 상태 확인
      logs.push("⏳ Waiting for deployment to complete...");
      const finalDeployment = await this.waitForDeployment(deployment.id);

      if (finalDeployment.readyState === 'READY') {
        logs.push(`🎉 Deployment successful: ${finalDeployment.url}`);

        // 4. 커스텀 도메인 설정 (옵션)
        let alias;
        if (config.domain) {
          logs.push(`🔗 Setting up custom domain: ${config.domain}`);
          alias = await this.assignAlias(finalDeployment.url, config.domain);
        }

        return {
          success: true,
          deploymentId: deployment.id,
          url: finalDeployment.url,
          alias: alias?.alias,
          logs
        };
      } else {
        logs.push(`❌ Deployment failed: ${finalDeployment.readyState}`);

        // 에러 상세 정보가 있으면 추가
        let errorMessage = `Deployment failed with state: ${finalDeployment.readyState}`;
        if (finalDeployment.errorDetails) {
          if (finalDeployment.errorDetails.summary) {
            errorMessage += `\n\nError details:\n${finalDeployment.errorDetails.summary}`;
            logs.push(`📋 Error details: ${finalDeployment.errorDetails.summary}`);
          }
        }

        return {
          success: false,
          error: errorMessage,
          logs
        };
      }

    } catch (error) {
      logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs
      };
    }
  }

  // Vercel API를 통한 배포 생성 (v13 API로 변경)
  private async createDeployment(payload: { name: string; files: Array<{ file: string; data: string }> }) {
    // 파일 해시들을 미리 계산
    const filesWithHashes = await Promise.all(
      payload.files.map(async (file) => ({
        file: file.file,
        sha: await this.generateSHA1(file.data),
        size: Buffer.from(file.data, 'base64').length
      }))
    );

    // Vercel API v13 형식으로 변경 - 파일을 직접 포함하지 않고 별도 업로드
    const deploymentPayload = {
      name: payload.name,
      files: filesWithHashes,
      target: 'production'
    };

    console.log('Sending deployment payload (v13):', {
      name: deploymentPayload.name,
      filesCount: deploymentPayload.files.length,
      target: deploymentPayload.target
    });

    // 1. 먼저 파일들을 업로드
    await this.uploadFiles(payload.files);

    // 2. 배포 생성
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Vercel API v13 error:', error);
      throw new Error(`Failed to create deployment: ${error}`);
    }

    return response.json();
  }

  // 파일 업로드를 위한 별도 메서드
  private async uploadFiles(files: Array<{ file: string; data: string }>) {
    for (const file of files) {
      const sha = await this.generateSHA1(file.data);

      // 파일이 이미 업로드되었는지 확인
      const checkResponse = await fetch(`https://api.vercel.com/v2/files/${sha}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
        }
      });

      if (checkResponse.status === 404) {
        // 파일이 없으면 업로드
        const uploadResponse = await fetch(`https://api.vercel.com/v2/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/octet-stream',
            'x-vercel-digest': sha,
            ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
          },
          body: Buffer.from(file.data, 'base64')
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.text();
          throw new Error(`Failed to upload file ${file.file}: ${error}`);
        }
      }
    }
  }

  // SHA1 해시 생성
  private async generateSHA1(base64Data: string): Promise<string> {
    const crypto = await import('crypto');
    const buffer = Buffer.from(base64Data, 'base64');
    return crypto.createHash('sha1').update(buffer).digest('hex');
  }

  // 배포 상태 확인 및 대기
  private async waitForDeployment(deploymentId: string, maxWaitTime = 300000): Promise<{ readyState: string; url?: string; errorDetails?: unknown }> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const deployment = await this.getDeployment(deploymentId);

      if (deployment.readyState === 'READY') {
        return deployment;
      } else if (deployment.readyState === 'ERROR') {
        // ERROR 상태일 때 추가 정보 수집
        const errorDetails = await this.getDeploymentErrorDetails(deploymentId);
        return {
          ...deployment,
          errorDetails
        };
      }

      // 5초 대기 후 다시 확인
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Deployment timeout');
  }

  // 배포 상태 조회
  private async getDeployment(deploymentId: string) {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get deployment status: ${response.statusText}`);
    }

    return response.json();
  }

  // 배포 에러 상세 정보 조회
  private async getDeploymentErrorDetails(deploymentId: string) {
    try {
      // 빌드 로그 가져오기
      const buildLogsResponse = await fetch(`https://api.vercel.com/v2/deployments/${deploymentId}/events`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
        }
      });

      if (buildLogsResponse.ok) {
        const buildLogs = await buildLogsResponse.json();
        const errorEvents = buildLogs.filter((event: { type: string; payload?: { text?: string }; text?: string }) =>
          event.type === 'stderr' ||
          event.type === 'error' ||
          (event.payload && event.payload.text && event.payload.text.toLowerCase().includes('error'))
        );

        return {
          buildLogs: errorEvents,
          summary: errorEvents.map((event: { payload?: { text?: string }; text?: string }) => event.payload?.text || event.text).join('\n')
        };
      }

      return { error: 'Could not fetch deployment logs' };
    } catch (error) {
      return { error: `Failed to get error details: ${error}` };
    }
  }

  // 커스텀 도메인 할당
  private async assignAlias(deploymentUrl: string, customDomain: string) {
    const response = await fetch('https://api.vercel.com/v2/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      },
      body: JSON.stringify({
        deploymentId: deploymentUrl.split('/').pop(),
        alias: customDomain
      })
    });

    if (!response.ok) {
      console.warn(`Failed to assign alias: ${response.statusText}`);
      return null;
    }

    return response.json();
  }

  // 파일 포맷 준비 (Vercel API v6 형식)
  private prepareFiles(files: Array<{ path: string; content: string }>) {
    return files.map(file => ({
      file: file.path,
      data: Buffer.from(file.content, 'utf-8').toString('base64') // v6 API는 base64 필요
    }));
  }

  // 프로젝트 목록 조회
  async getProjects() {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get projects: ${response.statusText}`);
    }

    return response.json();
  }

  // 배포 이력 조회
  async getDeployments(projectId?: string) {
    const url = projectId
      ? `https://api.vercel.com/v13/deployments?projectId=${projectId}`
      : 'https://api.vercel.com/v13/deployments';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get deployments: ${response.statusText}`);
    }

    return response.json();
  }

  // 배포 삭제
  async deleteDeployment(deploymentId: string) {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        ...(this.teamId && { 'X-Vercel-Team-Id': this.teamId })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete deployment: ${response.statusText}`);
    }

    return response.json();
  }
}

// 환경변수에서 Vercel 설정 가져오기
export function createVercelDeployer(): VercelDeployer | null {
  const apiToken = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!apiToken) {
    console.error('VERCEL_API_TOKEN environment variable is required');
    return null;
  }

  return new VercelDeployer(apiToken, teamId);
}

export default VercelDeployer;