// Type overrides for UI components to fix TypeScript errors
declare module "@/components/ui/tabs" {
  export const Tabs: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & 
    { defaultValue?: string; value?: string; onValueChange?: (value: string) => void } & 
    React.RefAttributes<HTMLDivElement>
  >;
  export const TabsList: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const TabsTrigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & 
    { value: string } & 
    React.RefAttributes<HTMLButtonElement>
  >;
  export const TabsContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & 
    { value: string } & 
    React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/badge" {
  export const Badge: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & 
    { variant?: string } & 
    React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/button" {
  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & 
    { variant?: string; size?: string } & 
    React.RefAttributes<HTMLButtonElement>
  >;
}

declare module "@/components/ui/input" {
  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & 
    React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/card" {
  export const Card: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const CardHeader: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const CardContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const CardTitle: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>
  >;
  export const CardDescription: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
  >;
}

declare module "@/components/ui/table" {
  export const Table: React.ForwardRefExoticComponent<
    React.TableHTMLAttributes<HTMLTableElement> & React.RefAttributes<HTMLTableElement>
  >;
  export const TableHeader: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>
  >;
  export const TableBody: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>
  >;
  export const TableRow: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>
  >;
  export const TableHead: React.ForwardRefExoticComponent<
    React.ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>
  >;
  export const TableCell: React.ForwardRefExoticComponent<
    React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>
  >;
}

declare module "@/components/ui/dialog" {
  export const Dialog: React.FC<any>;
  export const DialogTrigger: React.ForwardRefExoticComponent<any>;
  export const DialogContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>
  >;
  export const DialogDescription: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
  >;
}

declare module "@/components/ui/label" {
  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>
  >;
}
