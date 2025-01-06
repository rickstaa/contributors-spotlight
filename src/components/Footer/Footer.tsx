/**
 * @file Contains the application footer component.
 */

/**
 * App footer with call to action.
 */
export const Footer = () => {
  return (
    <footer className="md:px-8 md:py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm leading-loose text-muted-foreground">
          Excited to contribute? Visit our{" "}
          <a
            href="https://www.livepeer.org/dev-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-livepeer"
          >
            Dev Hub
          </a>{" "}
          to get started!
        </p>
      </div>
    </footer>
  );
};

export default Footer;
