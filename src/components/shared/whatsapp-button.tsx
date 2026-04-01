import Link from "next/link";

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/923000445759?text=Hi%2C%20I%20would%20like%20to%20place%20an%20order."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-3.5 shadow-lg ring-4 ring-[#25D366]/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />

      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="white"
        className="relative z-10 h-6 w-6 shrink-0"
        aria-hidden="true"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16a15.93 15.93 0 0 0 2.142 7.978L.74 29.38a1 1 0 0 0 1.225 1.258l5.57-1.461A15.937 15.937 0 0 0 16.004 32C24.827 32 32 24.822 32 16S24.827 0 16.004 0zm9.298 22.617c-.385 1.085-1.91 1.986-3.13 2.249-.834.178-1.922.32-5.586-1.2-4.69-1.944-7.712-6.703-7.947-7.012-.226-.308-1.9-2.529-1.9-4.826 0-2.296 1.185-3.413 1.636-3.874.386-.394.893-.555 1.378-.555.166 0 .315.008.45.015.451.019.678.046.975.759.375.893 1.286 3.19 1.399 3.423.115.232.23.546.069.854-.153.316-.288.456-.52.724-.231.267-.45.471-.681.757-.211.251-.45.52-.184.97.267.44 1.187 1.954 2.545 3.163 1.748 1.559 3.167 2.05 3.663 2.266.379.163.826.122 1.103-.17.352-.375.786-.995 1.228-1.607.312-.434.707-.488 1.12-.334.422.147 2.666 1.256 3.123 1.485.457.23.761.34.871.532.109.193.109 1.119-.277 2.382z" />
      </svg>

    </Link>
  );
}
