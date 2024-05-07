const Footer = () => {
  return (
    <footer className="bg-accent p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>
          © {new Date().getFullYear()} Fabian S. Klinke, Aleksandra Klushina
        </p>
        <p className="text-sm text-secondary">
          Musik, Medium und Emotion: Einführung in die angewandte
          Musikpsychologie
        </p>
        <p className="text-sm text-secondary">
          Bei Steffen Lepa, Fachgebiet Audiokommunikation, TU Berlin, SoSe 2024
        </p>
      </div>
    </footer>
  );
};

export default Footer;
