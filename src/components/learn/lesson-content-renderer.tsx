
import type { LessonContentBlock } from "@/types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface LessonContentRendererProps {
  block: LessonContentBlock;
}

export function LessonContentRenderer({ block }: LessonContentRendererProps) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose dark:prose-invert max-w-none text-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {block.value}
          </ReactMarkdown>
        </div>
      );
    case "image":
      return (
        <div className="my-6 relative aspect-video max-h-[400px] w-full overflow-hidden rounded-lg shadow-md">
          <Image
            src={block.value}
            alt={block.altText || "Lesson image"}
            layout="fill"
            objectFit="contain" 
            className="rounded-lg"
            data-ai-hint="lesson content image"
          />
        </div>
      );
    case "video":
      return (
        <div className="my-6 aspect-video w-full overflow-hidden rounded-lg shadow-md">
          <iframe
            src={block.value} 
            title="Lesson Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        </div>
      );
    case "formula":
      return (
        <Card className="my-4 bg-muted/50">
          <CardContent className="p-4">
            <p className="font-mono text-center text-lg text-primary">
              {block.value}
            </p>
          </CardContent>
        </Card>
      );
    default:
      return <p className="text-red-500">Unsupported content type</p>;
  }
}
