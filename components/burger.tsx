//This is a hmaburger component for the mobile view
import { useDisclosure } from "@mantine/hooks";
import { Burger } from "@mantine/core";

export default function BurgerMenu() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
  );
}
