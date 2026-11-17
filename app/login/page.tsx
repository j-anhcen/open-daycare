import type { Metadata } from "next";

import { loginPageData } from "@/app/_data/auth";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { LoginPanel } from "@/components/auth/LoginPanel";

export const metadata: Metadata = {
  title: "Iniciar sesión · OpenDayCare",
  description: "Ingresá para ver el día de hoy.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh bg-auth-background md:grid-cols-[1.05fr_1fr]">
      <BrandPanel data={loginPageData} />
      <div className="flex items-center justify-center p-10">
        <LoginPanel data={loginPageData} />
      </div>
    </div>
  );
}
