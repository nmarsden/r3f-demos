/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {Link} from "wouter";
import {ReactNode, useCallback, useEffect, useState} from "react";
import "./menu.css";
import {useHashLocation} from "../../hooks/hashLocation.ts";

export type Page = {
  name: string;
  path: string;
  screenshot: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFn: (props: any) => ReactNode;
  cameraPosition?: THREE.Vector3;
}

const Menu = ({ pages }: { pages: Page[] }) => {
  const [location, hashNavigate] = useHashLocation();
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
            href={''}
            onClick={() => {
              setDropDownMenuOpen(false)
              hashNavigate(page.path)
            }}
          >
            <a className={location === page.path ? 'menuItem selected' : 'menuItem'}>{page.name}</a>
          </Link>
        )}
      </div>
      <div className={isHeadingShown ? 'menuHeading show' : 'menuHeading'}>{selectedPage.screenshot !== '' ? selectedPage.name : ''}</div>
    </div>
  )
}

export { Menu }