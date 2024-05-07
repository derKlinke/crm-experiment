import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-accent text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-lg m-0">CRM Example</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/">experiment</Link>
            </li>
            <li>
              <Link href="/results">results</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
