import React, { useState, useEffect } from "react";
import { ClipboardIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const RunTestCaseTable = () => {
  const [runData, setRunData] = useState([]);
  const [filteredRunData, setFilteredRunData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);
  const [selectedProject, setSelectedProject] = useState("All Projects");

  useEffect(() => {
    const fetchRunData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const data = Array.from({ length: 10 }, (_, index) => ({
            runId: index + 1,
            projectName: `Project ${index + 1}`,
            totalTests: Math.floor(Math.random() * 100),
            passed: Math.floor(Math.random() * 50),
            failed: Math.floor(Math.random() * 20),
            blocked: Math.floor(Math.random() * 10),
            skipped: Math.floor(Math.random() * 10),
            testDetails: [
              {
                testId: `T-${index + 1}-1`,
                requestURL: `/api/run/${
                  index + 1
                }/test/1?param1=sample1&param2=sample2`,
                payload: `{"param": "sample1"}`,
                response: `{"status": "success"}`,
                status: "Passed",
              },
              {
                testId: `T-${index + 1}-2`,
                requestURL: `/api/run/${
                  index + 1
                }/test/2?param1=sample5&param2=sample6`,
                payload: `{"param": "sample2"}`,
                response: `{"status": "error"}`,
                status: "Failed",
              },
            ],
          }));
          setRunData(data);
          setFilteredRunData(data);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to fetch data");
        setIsLoading(false);
      }
    };

    fetchRunData();
  }, []);

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    if (projectName === "All Projects") {
      setFilteredRunData(runData);
    } else {
      setFilteredRunData(
        runData.filter((run) => run.projectName === projectName)
      );
    }
  };

  const toggleRow = (runId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [runId]: !prevState[runId],
    }));
  };

  const toggleAllRows = () => {
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    const newExpandedState = runData.reduce((acc, run) => {
      acc[run.runId] = newState;
      return acc;
    }, {});
    setExpandedRows(newExpandedState);
  };

  const handleCopy = (text, uniqueId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTextId(uniqueId);
      setTimeout(() => setCopiedTextId(null), 2000);
    });
  };

  const handleExpandContent = (content) => {
    setExpandedContent(content);
  };

  const closeExpandedContent = () => {
    setExpandedContent(null);
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-background") {
      closeExpandedContent();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-red-500"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700">
          "Hang tight! 🌐 Preparing test run data with precision."
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-full">
      <h1 className="text-2xl font-bold mb-6 text-start">Run Test Cases</h1>

      {/* Project Selection Dropdown */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="font-semibold text-gray-700">Select Project:</label>
        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All Projects">All Projects</option>
          {runData.map((run) => (
            <option key={run.runId} value={run.projectName}>
              {run.projectName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-auto rounded-lg shadow max-w-full">
        <table className="min-w-full w-full bg-white border-collapse">
          <thead className="bg-gradient-to-r from-sky-900 to-teal-900 text-white border-b border-gray-300">
            <tr>
              <th className="p-3 text-center border-r border-gray-200">
                <button
                  onClick={toggleAllRows}
                  className="text-white focus:outline-none"
                >
                  {isAllExpanded ? "Collapse All" : "Expand All"}
                </button>
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Run ID
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Project Name
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Total Tests
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Passed
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Failed
              </th>
              <th className="p-3 text-center border-r border-gray-200">
                Blocked
              </th>
              <th className="p-3 text-center">Skipped</th>
            </tr>
          </thead>
          <tbody>
            {filteredRunData.map((run) => (
              <React.Fragment key={run.runId}>
                <tr
                  className={`cursor-pointer ${
                    expandedRows[run.runId] ? "bg-blue-50" : "bg-white"
                  } hover:bg-blue-100 border-b border-gray-200`}
                  onClick={() => toggleRow(run.runId)}
                >
                  <td className="p-3 text-center border-r border-gray-200">
                    {expandedRows[run.runId] ? "▲" : "▼"}
                  </td>
                  <td className="p-3 text-center border-r border-gray-200">
                    {run.runId}
                  </td>
                  <td className="p-3 text-center border-r border-gray-200">
                    {run.projectName}
                  </td>
                  <td className="p-3 text-center border-r border-gray-200">
                    {run.totalTests}
                  </td>
                  <td className="p-3 text-center text-green-600 border-r border-gray-200">
                    {run.passed}
                  </td>
                  <td className="p-3 text-center text-red-600 border-r border-gray-200">
                    {run.failed}
                  </td>
                  <td className="p-3 text-center text-blue-600 border-r border-gray-200">
                    {run.blocked}
                  </td>
                  <td className="p-3 text-center">{run.skipped}</td>
                </tr>
                {expandedRows[run.runId] && (
                  <tr>
                    <td colSpan="8" className="p-4 bg-gray-50">
                      <div className="overflow-auto rounded-lg shadow-inner bg-white">
                        <table className="min-w-full bg-white border border-gray-300">
                          <thead className="bg-gray-700 text-white">
                            <tr>
                              <th className="p-3 text-center border-r border-gray-300">
                                Test ID
                              </th>
                              <th className="p-3 text-center border-r border-gray-300">
                                Request URL
                              </th>
                              <th className="p-3 text-center border-r border-gray-300">
                                Payload
                              </th>
                              <th className="p-3 text-center border-r border-gray-300">
                                Response
                              </th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {run.testDetails.map((test) => (
                              <tr
                                key={test.testId}
                                className="hover:bg-gray-100 border-b border-gray-200"
                              >
                                <td className="p-3 text-center border-r border-gray-200">
                                  {test.testId}
                                </td>
                                <td className="p-3 text-center border-r border-gray-200">
                                  <span
                                    onClick={() =>
                                      handleExpandContent(test.requestURL)
                                    }
                                    className="cursor-pointer hover:underline"
                                    title={test.requestURL}
                                  >
                                    {test.requestURL.length > 30
                                      ? `${test.requestURL.slice(0, 30)}...`
                                      : test.requestURL}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(
                                        test.requestURL,
                                        `${run.runId}-${test.testId}-url`
                                      );
                                    }}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                    title="Copy Request URL"
                                  >
                                    {copiedTextId ===
                                    `${run.runId}-${test.testId}-url` ? (
                                      <CheckIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <ClipboardIcon className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                                <td className="p-3 text-center border-r border-gray-200">
                                  <span
                                    onClick={() =>
                                      handleExpandContent(test.payload)
                                    }
                                    className="cursor-pointer hover:underline"
                                    title={test.payload}
                                  >
                                    {test.payload.length > 30
                                      ? `${test.payload.slice(0, 30)}...`
                                      : test.payload}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(
                                        test.payload,
                                        `${run.runId}-${test.testId}-payload`
                                      );
                                    }}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                    title="Copy Payload"
                                  >
                                    {copiedTextId ===
                                    `${run.runId}-${test.testId}-payload` ? (
                                      <CheckIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <ClipboardIcon className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                                <td className="p-3 text-center border-r border-gray-200">
                                  {test.response}
                                </td>
                                <td className="p-3 text-center">
                                  {test.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {expandedContent && (
        <div
          id="modal-background"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 focus:outline-none"
          onClick={handleOutsideClick}
          tabIndex={-1}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-xl w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="modal-title"
              className="text-lg font-semibold mb-4 flex items-center"
            >
              Full Content
              <button
                onClick={closeExpandedContent}
                className="ml-auto text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close expanded content modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto relative">
              {expandedContent}
              <span
                onClick={() => handleCopy(expandedContent, `modal-content`)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Copy Content"
                aria-label="Copy content to clipboard"
              >
                {copiedTextId === "modal-content" ? (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ClipboardIcon className="w-5 h-5" />
                )}
              </span>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunTestCaseTable;
