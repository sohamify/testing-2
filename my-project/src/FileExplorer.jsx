import { useEffect, useState } from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import { FcFolder } from "react-icons/fc";
import { BsFileText } from "react-icons/bs";
import { FaJsSquare, FaChevronRight, FaChevronDown } from "react-icons/fa";
import python from "./assets/python.svg";
import cross from "./assets/cross.svg";

export default function FileExplorer() {
  const [openFile, setOpenFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [fileStructure, setFileStructure] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function loadGitHubFiles() {
      const repoData = await fetchGitHubRepo("sohamify", "testing-3");
      setFileStructure(repoData);
    }
    loadGitHubFiles();
  }, []);

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

  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const fetchFileContent = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file content");
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        setFileContent(JSON.stringify(json, null, 2));
      } else {
        const text = await response.text();
        setFileContent(text);
      }
      
      setSelectedFile(fileName);
    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent("Error loading file");
    }
  };

  const renderFileIcon = (fileName) => {
    if (fileName.endsWith(".js")) return <FaJsSquare className="text-yellow-400" />;
    if (fileName.endsWith(".py")) return <img src={python} alt="Python" className="w-4 h-4" />;
    if (fileName.endsWith(".txt")) return <BsFileText className="text-gray-400" />;
    return null;
  };

  const renderTree = (nodes) => (
    <ul>
      {nodes.map((node, index) => (
        <li key={node.path || node.name} className="p-1">
          {node.type === "folder" ? (
            <>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleFolder(node.path)}  
              >
                {openFolders[node.path] ? <FaChevronDown /> : <FaChevronRight /> }
                <FcFolder className="ml-1" />
                <span className="font-bold ml-2">{node.name}</span>
              </div>
              {openFolders[node.path] && node.children && (
                <div className="ml-6 border-l border-gray-600 pl-2">
                  {renderTree(node.children)}
                </div>
              )}
            </>
          ) : (
            <div
              className="cursor-pointer hover:bg-gray-700 p-1 flex items-center"
              onClick={() => {
                handleFileClick(node.name);
                fetchFileContent(node.download_url, node.name);
              }}
            >
              {renderFileIcon(node.name)}
              <span className="ml-2">{node.name}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex h-screen bg-[#272323]">
      {isSidebarOpen && (
        <div className="w-64 bg-white text-black font-medium ">
          <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-[#14A9CF]">
            <img src={cross} alt="cross" className="cursor-pointer h-8 w-8" onClick={() => setIsSidebarOpen(false)} />
          </div>
          {renderTree(fileStructure)}
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

        <div className="flex-1 bg-gray-900 text-white p-4">
          {selectedFile ? (
            <>
              <h2 className="text-lg font-bold">{selectedFile}</h2>
              <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
                {fileContent}
              </pre>
            </>
          ) : (
            <p className="text-gray-400">Select a file to view its content.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const folderCache = new Map();

async function fetchGitHubRepo(owner, repo, path = "") {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  if (folderCache.has(path)) {
    return folderCache.get(path);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch repository data");

    const data = await response.json();
    let result = [];

    for (const item of data) {
      if (item.type === "dir") {
        const children = await fetchGitHubRepo(owner, repo, item.path);
        result.push({
          name: item.name,
          type: "folder",
          path: item.path,
          children: children,
        });
      } else {
        result.push({
          name: item.name,
          type: "file",
          path: item.path,
          download_url: item.download_url,
        });
      }
    }

    folderCache.set(path, result);
    return result;
  } catch (error) {
    console.error("Error fetching repository data:", error);
    return [];
  }
}
