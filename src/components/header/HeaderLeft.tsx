import React from "react";

const HeaderLeft: React.FC = () => {
  return (
    <div className="header-left">
      <a href="#home"><span className="header-icon">🏠</span>ホーム</a>
      <a href="#about"><span className="header-icon">ℹ️</span>概要</a>
    </div>
  );
};

export default HeaderLeft;