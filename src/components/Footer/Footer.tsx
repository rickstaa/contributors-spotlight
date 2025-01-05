/**
 * @file Contains the application footer component.
 */

/**
 * App footer with call to action.
 */
export const Footer = () => {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container mx-auto text-center py-4">
        <p className="text-sm leading-loose text-muted-foreground">
          Want to join our top contributors? Visit our{" "}
          <a
            href="https://www.livepeer.org/dev-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-livepeer"
          >
            Dev Hub
          </a>
          !
        </p>
      </div>
    </footer>
  );
};

export default Footer;
