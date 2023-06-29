interface NavbarItem {
  text: string;
  link: string;
}

interface SidebarItem {
  text: string;
  collapsible: boolean;
  sidebarDepth: number;
  children: Array<string | SidebarItem>;
}
