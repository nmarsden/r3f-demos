/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Link, useLocation} from "wouter";
import {ReactNode} from "react";
import "./menu.css";

export type Page = {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFn: (props: any) => ReactNode;
}

const Menu = ({ pages }: { pages: Page[] }) => {
  const [location] = useLocation();

  return (
    <div className='menu'>
      { pages.map(page =>
        <Link
          key={page.name}
          href={page.path}
        >
          <a className={location === page.path ? 'menuItem selected' : 'menuItem'}>{page.name}</a>
        </Link>) }
    </div>
  )
}

export { Menu }