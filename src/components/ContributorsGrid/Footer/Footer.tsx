/**
 * @file Contains the contributors grid footer component.
 */

/**
 * Contributors grid footer component.
 */
export const Footer = () => {
  return (
    <footer className="px-8 py-4">
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
