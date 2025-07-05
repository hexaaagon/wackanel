"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "rounded-base border-border shadow-shadow overflow-hidden border-2 border-b",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "text-main-foreground bg-background/50 border-border font-heading flex flex-1 items-center justify-between p-4 text-left text-base transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=open]:rounded-b-none data-[state=open]:border-b-2 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="pointer-events-none size-5 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="rounded-b-base bg-secondary-background font-base data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all"
      {...props}
    >
      <div className={cn("p-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
