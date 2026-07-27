"use client";

import { code } from "@streamdown/code";
import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

const streamdownPlugins = { code };

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      className={["size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className]
        .filter(Boolean)
        .join(" ")}
      plugins={streamdownPlugins}
      {...props}
    />
  ),
  (previous, next) =>
    previous.children === next.children && previous.isAnimating === next.isAnimating
);

MessageResponse.displayName = "MessageResponse";
