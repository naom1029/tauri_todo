import React from "react";

const HeaderRight: React.FC = () => {
  return (
    <div className="header-right">
      <a href="#settings"><span className="header-icon">⚙️</span>設定</a>
      <a href="#profile"><span className="header-icon">👤</span>プロフィール</a>
    </div>
  );
};

export default HeaderRight;
