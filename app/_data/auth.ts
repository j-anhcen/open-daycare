export type LoginPageData = {
  brandName: string;
  roomFooterLabel: string;
  headline: string;
  tagline: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  submitLabel: string;
  signupQuestion: string;
  signupLinkLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
};

export type ActivationPageData = {
  title: string;
  intro: string;
  invitedToLabel: string;
  childLabel: string;
  childInitial: string;
  codeLabel: string;
  emailLabel: string;
  passwordLabel: string;
  consentLabel: string;
  submitLabel: string;
  loginQuestion: string;
  loginLinkLabel: string;
  prefillCode: string;
  prefillEmail: string;
  prefillPassword: string;
};

// Copy mirrors references/pantallas/login.dc.html. The Personal/Familia
// role picker from the mockup was dropped by decision in specs/03.
export const loginPageData: LoginPageData = {
  brandName: "OpenDayCare",
  roomFooterLabel: "🌿 Guardería Sala Soles",
  headline: "El día de cada niño, compartido con su familia.",
  tagline:
    "Publicá momentos, gestioná las salas y mantené a las familias cerca, desde un solo lugar.",
  title: "Iniciar sesión",
  subtitle: "Ingresá para ver el día de hoy.",
  emailLabel: "EMAIL",
  passwordLabel: "CONTRASEÑA",
  forgotPasswordLabel: "¿Olvidaste tu contraseña?",
  submitLabel: "Iniciar sesión",
  signupQuestion: "¿Te invitó la guardería?",
  signupLinkLabel: "Activá tu cuenta",
  emailPlaceholder: "caro@opendaycare.com",
  passwordPlaceholder: "••••••••",
};

// Copy mirrors references/pantallas/activar-cuenta.dc.html.
export const activationPageData: ActivationPageData = {
  title: "Bienvenida a OpenDayCare",
  intro:
    "Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.",
  invitedToLabel: "Te invitaron a seguir a",
  childLabel: "Mateo · Sala Soles",
  childInitial: "M",
  codeLabel: "CÓDIGO DE INVITACIÓN",
  emailLabel: "EMAIL",
  passwordLabel: "CREAR CONTRASEÑA",
  consentLabel:
    "Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.",
  submitLabel: "Activar mi cuenta",
  loginQuestion: "¿Ya tenés cuenta?",
  loginLinkLabel: "Iniciar sesión",
  prefillCode: "7K4P9",
  prefillEmail: "lucia.fernandez@gmail.com",
  prefillPassword: "contraseña",
};
