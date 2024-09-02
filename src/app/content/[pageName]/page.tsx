import fs from 'fs';
import path from 'path';
import TopHeaderStatic from "@/components/top-header-static";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import styles from './page.module.css';
import { notFound } from 'next/navigation';

export default async function DynamicMarkdownPage({ params }: { params: { pageName: string } }) {
  try {
    const content = await getContent({ params: { pageName: params.pageName } });
    return (
      <div>
        <TopHeaderStatic />
        <div className="grid min-h-screen w-full bg-zinc-100 dark:bg-zinc-950">
          <div className="md:p-4 xs:p-5">
            <div className="flex-1 overflow-auto">
              <div className="grid gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
                  <Markdown className={styles.markdown} remarkPlugins={[remarkGfm]}>
                    {content}
                  </Markdown>
                </div>  
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}

export async function getContent({ params }: { params: { pageName: string } }) {
  const filePath = path.join(process.cwd(), 'src', 'content', `${params.pageName}.md`);
  const content = fs.readFileSync(filePath, 'utf8');

  return content;
}