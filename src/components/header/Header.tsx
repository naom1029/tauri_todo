import "./Header.css";
import HeaderLeft from "./HeaderLeft";
import HeaderCenter from "./HeaderCenter";
import HeaderRight from "./HeaderRight";

const Header = () => {
  return (
    <div className="header-containers">
      <HeaderLeft />
      <HeaderCenter />
      <HeaderRight />
    </div>
  );
};

export default Header;
