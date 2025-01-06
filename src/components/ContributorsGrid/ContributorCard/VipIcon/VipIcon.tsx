/**
 * @file Contains a VIP icon component that dynamically loads the VIP icon from lucide-react based on the VIP_ICON configuration.
 */
"use client";
import { useEffect, useState } from "react";
import { Star, LucideIcon } from "lucide-react";
import { VIP_ICON } from "@/app/config";
import { capitalize } from "@/lib/utils";

/**
 * Represents the properties of the VIP icon component. Forwards all props to the SVG element.
 */
type IconProps = React.HTMLAttributes<SVGElement>;

/**
 * Component that displays a VIP icon based on the VIP_ICON configuration.
 * Dynamically loads the icon from lucide-react.
 * @param props - The component properties.
 */
export const VipIcon = (props: IconProps) => {
  const [IconComponent, setIconComponent] = useState<LucideIcon>(() => Star);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const Icons = await import("lucide-react");
        const iconName = capitalize(VIP_ICON) as keyof typeof Icons;
        const DynamicIcon = Icons[iconName] as LucideIcon;

        if (DynamicIcon) {
          setIconComponent(() => DynamicIcon);
        } else {
          console.warn(
            `Icon "${iconName}" not found in lucide-react. Falling back to default icon.`
          );
        }
      } catch (error) {
        console.error("Error loading icon:", error);
      }
    };

    loadIcon();
  }, []);

  return <IconComponent {...props} />;
};

export default VipIcon;
