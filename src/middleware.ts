import { withAuth } from "next-auth/middleware"

// 미들웨어는 next-auth의 withAuth 헬퍼를 사용하여 export됩니다.
// 이를 통해 요청이 인증되었는지 확인하고, 그렇지 않은 경우 로그인 페이지로 리디렉션합니다.
export default withAuth({
  pages: {
    // 사용자가 접근하려던 페이지가 보호된 경로일 때, 인증되지 않은 경우 리디렉션할 경로를 지정합니다.
    signIn: "/login",
  },
})

// config 객체는 미들웨어가 어떤 경로에서 실행되어야 하는지를 정의합니다.
export const config = { 
  matcher: [
    // 미들웨어를 적용할 경로를 지정합니다.
    // '/': 프로젝트의 메인 페이지
    // '/editor/:path*': 에디터와 관련된 모든 하위 경로
    "/",
    "/editor/:path*",
  ],
}

// 미들웨어의 런타임을 'nodejs'로 명시합니다.
// 이는 Prisma와 같이 Node.js API에 의존하는 라이브러리를 미들웨어에서 사용하기 위해 필요합니다.
export const runtime = "nodejs"; 
