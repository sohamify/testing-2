import { useState } from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import { FcFolder } from "react-icons/fc";
import { BsFileText } from "react-icons/bs";
import { FaJsSquare } from "react-icons/fa";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import python from "./assets/python.svg";
import cross from "./assets/cross.svg"

const fileStructure = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "page1.py", type: "file" },
      { name: "page2.py", type: "file" },
      { name: "page3.js", type: "file" },
      { name: "page4.js", type: "file" },
    ],
  },
  { name: "requirements.txt", type: "file" },
  { name: "app.py", type: "file" },
];

export default function FileExplorer() {
  const [openFile, setOpenFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState([]);
  const [openFolders, setOpenFolders] = useState({});

  const handleFileClick = (fileName) => {
    setOpenFile(fileName);
    if (!openTabs.includes(fileName)) {
      setOpenTabs([...openTabs, fileName]);
    }
  };

  const handleCloseTab = (fileName) => {
    const updatedTabs = openTabs.filter((tab) => tab !== fileName);
    setOpenTabs(updatedTabs);
    if (openFile === fileName) {
      setOpenFile(updatedTabs.length ? updatedTabs[updatedTabs.length - 1] : null);
    }
  };

  const toggleFolder = (folderName) => {
    setOpenFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const renderFileIcon = (fileName) => {
    if (fileName.endsWith(".js")) return <FaJsSquare className="text-yellow-400" />;
    if (fileName.endsWith(".py")) return <img src={python} alt="Python" className="w-4 h-4" />;
    if (fileName.endsWith(".txt")) return <BsFileText className="text-gray-400" />;
    return null;
  };

  return (
    <div className="flex h-screen bg-[#272323]">
      {isSidebarOpen && (
        <div className="w-64 bg-white text-black font-medium ">
          <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-[#14A9CF]">
            {/* <span>Explorer</span>
            <FaTimes className="cursor-pointer" onClick={() => setIsSidebarOpen(false)} /> */}
            <img src={cross} alt="cross" className="cursor-pointer h-8 w-8" onClick={() => setIsSidebarOpen(false)} />
          </div>
          <ul>
            {fileStructure.map((item, index) => (
              <li key={index} className="p-1">
                {item.type === "folder" ? (
                  <>
                    <div className="flex items-center cursor-pointer" onClick={() => toggleFolder(item.name)}>
                      {openFolders[item.name] ? <FaChevronDown /> : <FaChevronRight />}
                      <FcFolder className="ml-1" />
                      <span className="font-bold ml-2">{item.name}</span>
                    </div>
                    {openFolders[item.name] && (
                      <ul className="ml-6 border-l border-gray-600 pl-2">
                        {item.children.map((file, i) => (
                          <li
                            key={i}
                            className="cursor-pointer hover:bg-gray-700 p-1 flex items-center"
                            onClick={() => handleFileClick(file.name)}
                          >
                            {renderFileIcon(file.name)}
                            <span className="ml-2">{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-gray-700 p-1 flex items-center"
                    onClick={() => handleFileClick(item.name)}
                  >
                    {renderFileIcon(item.name)}
                    <span className="ml-2">{item.name}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-[#4CDAFE] font-semibold p-2 flex items-center">
          {!isSidebarOpen && (
            <FcFolder className="cursor-pointer mr-2 h-6 w-6" onClick={() => setIsSidebarOpen(true)} />
          )}
          <div className="flex space-x-2 overflow-x-auto cursor-pointer">
            {openTabs.map((tab) => (
              <div
                key={tab}
                className={`px-3 py-1 rounded-t-md flex items-center ${openFile === tab ? " border-b-2 border-red-500" : ""}`}
                onClick={() => setOpenFile(tab)}
              >
                {tab}
                {/* <FaTimes
                  className="ml-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab);
                  }}
                /> */}
                <img src={cross} alt="cross" className="h-6 w-6 ml-2 cursor-pointer" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab);
                      }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 text-white">
          {openFile ? <p>Editing: {openFile}</p> : <p>Select a file to view</p>}
        </div>
      </div>
    </div>
  );
}
