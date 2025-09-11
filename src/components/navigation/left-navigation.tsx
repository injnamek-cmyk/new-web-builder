import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function LeftNavigation() {
  return (
    <aside className="w-72 p-4 left-0 top-[60px] border-r border-stone-300/50 flex flex-col justify-start items-center gap-4">
      {/* 유저 정보 카드 */}
      <section className="w-60 h-20 p-4 rounded-xl shadow-md">
        <div className="w-40 flex gap-2 justify-start items-start">
          <Image
            src="/logo/ditto_green.svg"
            alt="Ditto"
            width={28}
            height={28}
          />
          <div>
            <span className="text-neutral-900 text-lg font-bold font-['Pretendard_JP'] leading-normal tracking-tight">
              (주) 엠엑스랩
            </span>
            <div className="flex items-start gap-2.5">
              <span className="text-zinc-700/80 text-[10px] font-bold font-['Pretendard_JP'] leading-3 tracking-tight">
                최재형
              </span>
              <span className="flex-1 justify-center items-center text-zinc-700/40 text-[10px] font-medium font-['Pretendard_JP'] leading-3 tracking-tight">
                관리자
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 메뉴들 */}
      <nav className="flex flex-col justify-start items-center gap-2 w-full">
        <Tabs defaultValue="studio" className="w-full">
          {/* 탭 리스트 */}
          <div className="w-full flex flex-col justify-center items-start gap-1">
            <hr className="w-full h-px bg-zinc-300/50" />
            <div className="px-5 flex justify-between items-center w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-2">
                <TabsTrigger 
                  value="main" 
                  className="p-1 rounded-sm text-zinc-700/70 text-[10px] font-medium font-['Pretendard_JP'] leading-3 tracking-tight data-[state=active]:bg-zinc-500/20 data-[state=active]:text-neutral-900 data-[state=active]:font-semibold border-0 shadow-none"
                >
                  Menu
                </TabsTrigger>
                <TabsTrigger 
                  value="studio" 
                  className="p-1 rounded-sm text-zinc-700/70 text-[10px] font-medium font-['Pretendard_JP'] leading-3 tracking-tight data-[state=active]:bg-zinc-500/20 data-[state=active]:text-neutral-900 data-[state=active]:font-semibold border-0 shadow-none"
                >
                  Studio
                </TabsTrigger>
              </TabsList>
              <span className="h-4 py-3 flex flex-col justify-center items-center"></span>
            </div>
            <hr className="w-full h-px bg-zinc-300/50" />
          </div>

          {/* 탭 컨텐츠 */}
          <TabsContent value="main" className="w-full mt-0">
            <div className="text-center py-8 text-zinc-700/60 text-sm">
              Menu 탭 컨텐츠 (준비중)
            </div>
          </TabsContent>

          <TabsContent value="studio" className="w-full mt-0">
            <div className="flex flex-col justify-start items-start gap-2 w-full">
              <ul className="flex flex-col justify-start items-start gap-2 w-full pl-5">
                <li className="py-1 bg-zinc-500/10 rounded-sm text-neutral-900 text-xs font-medium">
                  Home
                </li>
                <li className="py-1 rounded-sm outline-[0.80px] outline-offset-[-0.80px] outline-teal-400 text-zinc-700/80 text-xs">
                  Sub 01
                </li>
              </ul>
              <hr className="w-full h-px bg-zinc-300/50" />
              
              {/* 주요 메뉴 트리 (아코디언) */}
              <Accordion type="multiple" className="w-full">
                {/* GNB 아코디언 - 기존 컨텐츠 있음 */}
                <AccordionItem value="gnb" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    GNB
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col justify-start items-start gap-0.5 w-full pl-5">
                      <li className="py-1 text-zinc-700/80 text-xs">BI</li>
                      <li className="py-1 text-zinc-700/80 text-xs">Menu 01</li>
                      <li className="py-1 text-zinc-700/80 text-xs">Menu 02</li>
                      <li className="py-1 text-zinc-700/80 text-xs">Menu 03</li>
                      <li className="py-1 text-zinc-700/80 text-xs">Menu 04</li>
                      <li className="py-1 text-zinc-700/80 text-xs">Sign-in</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* KeyVisual 아코디언 - 빈 컨텐츠 */}
                <AccordionItem value="keyvisual" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    KeyVisual
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-zinc-700/60 text-xs px-5 py-2">
                      컨텐츠 준비중
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Body 01 아코디언 - 빈 컨텐츠 */}
                <AccordionItem value="body01" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    Body 01
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-zinc-700/60 text-xs px-5 py-2">
                      컨텐츠 준비중
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Body 02 아코디언 - 빈 컨텐츠 */}
                <AccordionItem value="body02" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    Body 02
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-zinc-700/60 text-xs px-5 py-2">
                      컨텐츠 준비중
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Contact Us 아코디언 - 빈 컨텐츠 */}
                <AccordionItem value="contact" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    Contact Us
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-zinc-700/60 text-xs px-5 py-2">
                      컨텐츠 준비중
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Footer 아코디언 - 빈 컨텐츠 */}
                <AccordionItem value="footer" className="border-0">
                  <AccordionTrigger className="text-neutral-900 text-xs font-semibold py-1 hover:no-underline">
                    Footer
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-zinc-700/60 text-xs px-5 py-2">
                      컨텐츠 준비중
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </nav>
    </aside>
  );
}