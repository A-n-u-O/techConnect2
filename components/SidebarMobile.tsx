//I was contemplating how the design for the sidebar and the navbar should be for mobile
"use client"
import { useDisclosure } from "@mantine/hooks";
import { Burger } from "@mantine/core";

export default function SidebarMobile() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
  );
}
