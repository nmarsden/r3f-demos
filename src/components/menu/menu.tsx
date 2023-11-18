/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Link, useLocation} from "wouter";
import {ReactNode, useCallback, useEffect, useState} from "react";
import "./menu.css";

export type Page = {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFn: (props: any) => ReactNode;
}

const Menu = ({ pages }: { pages: Page[] }) => {
  const [location] = useLocation();
  const [isDropDownMenuOpen, setDropDownMenuOpen] = useState(false)
  const [isHeadingShown, setIsHeadingShown] = useState(true)
  const [selectedPage, setSelectedPage] = useState<Page>(pages[0]);

  useEffect(() => {
    setIsHeadingShown(false)
    setTimeout(() => {
      setSelectedPage(pages.find(page => page.path === location) as Page);
      setIsHeadingShown(true)
    }, 400)
  }, [location])

  const onMenuButtonClicked = useCallback(() => {
    setDropDownMenuOpen(!isDropDownMenuOpen)
  }, [isDropDownMenuOpen])

  return (
    <div className='menuWrapper'>
      <div className={isDropDownMenuOpen ? 'menuButton selected' : 'menuButton'} onClick={onMenuButtonClicked}>
        <svg viewBox="0 0 100 80" width="100%" height="100%" fill="white">
          <rect y="5" width="100" height="15"></rect>
          <rect y="35" width="100" height="15"></rect>
          <rect y="65" width="100" height="15"></rect>
        </svg>
      </div>
      <div className={isDropDownMenuOpen ? 'dropDownMenu open' : 'dropDownMenu'}>
        {pages.map(page =>
          <Link
            key={page.name}
            href={page.path}
            onClick={() => setDropDownMenuOpen(false)}
          >
            <a className={location === page.path ? 'menuItem selected' : 'menuItem'} data-content={page.name}>{page.name}</a>
          </Link>
        )}
      </div>
      <div className={isHeadingShown ? 'menuHeading show' : 'menuHeading'}>{selectedPage.name !== 'Demos' ? selectedPage.name : ''}</div>
    </div>
  )
}

export { Menu }