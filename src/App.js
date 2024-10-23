import React, { useState, useEffect } from "react";
import "./styles.css";

const App = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [openedFolders, setOpenedFolders] = useState({});
  const [searchFoldersOnly, setSearchFoldersOnly] = useState(false);

  useEffect(() => {
    // 从 JSON 文件获取产品数据
    fetch("https://leeergou711.github.io/SteinsGate/files.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        // 初始化文件夹展开状态，所有文件夹默认关闭
        const initialOpenedFolders = data
          .filter(product => product.category === "folder")
          .reduce((acc, product) => {
            acc[product.path] = false;
            return acc;
          }, {});
        setOpenedFolders(initialOpenedFolders);
        setFilteredProducts(data.filter(product => product.category === "folder" && !product.parent)); // 只初始化顶层文件夹
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      // 当搜索框为空时，只显示顶层文件夹
      setFilteredProducts(products.filter(product => product.category === "folder" && !product.parent));
    } else {
      // 进行深度搜索，显示所有匹配的产品或只搜索文件夹
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = products.filter((product) => {
        const matchesSearchTerm = product.name.toLowerCase().includes(lowercasedFilter);
        const matchesCategory = !searchFoldersOnly || product.category === "folder";
        return matchesSearchTerm && matchesCategory;
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products, searchFoldersOnly]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleFolder = (folderPath) => {
    setOpenedFolders((prevState) => ({
      ...prevState,
      [folderPath]: !prevState[folderPath],
    }));
  };

  const handleOpenFile = (filePath) => {
    const extension = filePath.split('.').pop();
    let fullPath = `https://github.com/LeeErGou711/SteinsGate/raw/main/src/files/${filePath}`;
    if (extension === 'epub') {
      fullPath = `https://raw.githubusercontent.com/LeeErGou711/SteinsGate/main/src/files/${filePath}`;
    }
    window.open(fullPath, "_blank");
  };

  const renderFolderContents = (parentPath) => {
    return products
      .filter((item) => item.parent === parentPath)
      .map((child) => (
        <div key={child.id} className="product-card child-card">
          {child.category === "folder" ? (
            <div>
              <div
                className="folder-name"
                onClick={() => handleToggleFolder(child.path)}
              >
                <h4>{child.name}</h4>
              </div>
              {openedFolders[child.path] && (
                <div className="folder-contents">
                  {renderFolderContents(child.path)}
                </div>
              )}
            </div>
          ) : (
            <div
              className="file-name"
              onClick={() => handleOpenFile(child.path)}
            >
              <h4>{child.name}</h4>
            </div>
          )}
        </div>
      ));
  };

  const renderFilteredProducts = () => {
    // 当搜索框为空时，只显示顶层文件夹
    if (searchTerm === "") {
      return filteredProducts.map((product) => (
        <div key={product.id} className="product-card">
          <div
            className="folder-name"
            onClick={() => handleToggleFolder(product.path)}
          >
            <h3>{product.name}</h3>
          </div>
          {openedFolders[product.path] && (
            <div className="folder-contents">
              {renderFolderContents(product.path)}
            </div>
          )}
        </div>
      ));
    } else {
      // 进行深度搜索，显示所有匹配的产品
      return filteredProducts.map((product) => {
        if (product.category === "folder") {
          return (
            <div key={product.id} className="product-card">
              <div
                className="folder-name"
                onClick={() => handleToggleFolder(product.path)}
              >
                <h3>{product.name}</h3>
              </div>
              {openedFolders[product.path] && (
                <div className="folder-contents">
                  {renderFolderContents(product.path)}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div
              key={product.id}
              className="product-card file-card"
              onClick={() => handleOpenFile(product.path)}
            >
              <h4>{product.name}</h4>
            </div>
          );
        }
      });
    }
  };

  const handleSearchFoldersOnlyChange = () => {
    setSearchFoldersOnly(!searchFoldersOnly);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>未来ガジェット研究所</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <label>
            <input
              type="checkbox"
              checked={searchFoldersOnly}
              onChange={handleSearchFoldersOnlyChange}
            />
            只搜索文件夹
          </label>
        </div>
      </header>
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          renderFilteredProducts()
        ) : (
          <p>暂无结果</p>
        )}
      </div>
    </div>
  );
};

export default App;
