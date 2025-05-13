
import type { LessonContentBlock } from "@/types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface LessonContentRendererProps {
  block: LessonContentBlock;
}

export function LessonContentRenderer({ block }: LessonContentRendererProps) {
  switch (block.type) {
    case "text":
      return <p className="mb-4 text-lg leading-relaxed">{block.value}</p>;
    case "image":
      return (
        <div className="my-6 relative aspect-video max-h-[400px] w-full overflow-hidden rounded-lg shadow-md">
          <Image
            src={block.value}
            alt={block.altText || "Lesson image"}
            layout="fill"
            objectFit="contain" // Changed to contain to ensure full image is visible
            className="rounded-lg"
            data-ai-hint="lesson content image"
          />
        </div>
      );
    case "video":
      return (
        <div className="my-6 aspect-video w-full overflow-hidden rounded-lg shadow-md">
          <iframe
            src={block.value} // Assuming block.value is a YouTube embed URL like "https://www.youtube.com/embed/VIDEO_ID"
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
