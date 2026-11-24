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
  codeLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  consentLabel: string;
  submitLabel: string;
  loginQuestion: string;
  loginLinkLabel: string;
  errorMessages: {
    passwordRequired: string;
    passwordTooShort: string;
    consentRequired: string;
    emailAlreadyRegistered: string;
    generic: string;
  };
  invalidInvitationData: {
    title: string;
    messages: {
      invalid: string;
      expired: string;
      alreadyUsed: string;
    };
  };
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
  codeLabel: "CÓDIGO DE INVITACIÓN",
  emailLabel: "EMAIL",
  passwordLabel: "CREAR CONTRASEÑA",
  passwordPlaceholder: "••••••••",
  consentLabel:
    "Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.",
  submitLabel: "Activar mi cuenta",
  loginQuestion: "¿Ya tenés cuenta?",
  loginLinkLabel: "Iniciar sesión",
  errorMessages: {
    passwordRequired: "Ingresá una contraseña.",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres.",
    consentRequired: "Tenés que aceptar el consentimiento para continuar.",
    emailAlreadyRegistered: "Ya existe una cuenta con este correo. Iniciá sesión.",
    generic: "No se pudo activar la cuenta. Intentá de nuevo.",
  },
  invalidInvitationData: {
    title: "Enlace inválido",
    messages: {
      invalid: "Esta invitación no es válida o fue cancelada.",
      expired: "Esta invitación venció. Pedile a la guardería que te envíe una nueva.",
      alreadyUsed: "Esta invitación ya fue utilizada. Ya podés iniciar sesión.",
    },
  },
};
