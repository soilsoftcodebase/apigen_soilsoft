import React, { useState, useEffect, useCallback } from "react";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import {
  getAllProjects,
  getTestRunsByProject,
} from "../Services/apiGenServices";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const RunTestCaseTable = () => {
  const [filteredRunData, setFilteredRunData] = useState([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedTextId, setCopiedTextId] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjectsAndRuns = useCallback(async () => {
    try {
      const projectsResponse = await getAllProjects();
      setProjects(projectsResponse || []);
    } catch (err) {
      console.error("Failed to fetch data. Please try again later.", err);
    }
  }, []);

  const fetchTestCases = useCallback(async (projectName) => {
    if (!projectName) return;
    setLoading(true);
    try {
      const data = await getTestRunsByProject(projectName);
      setFilteredRunData(data || []);
    } catch (error) {
      console.log("Failed to load test cases. Please try again later.", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectsAndRuns();
  }, [fetchProjectsAndRuns]);

  const handleProjectChange = async (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    setIsFiltering(true);

    if (!projectName) {
      setFilteredRunData([]);
    } else {
      await fetchTestCases(projectName);
    }
    setIsFiltering(false);
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
    const newExpandedState = filteredRunData.reduce((acc, run) => {
      acc[run.testRunId] = newState;
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

  const truncateText = (text, maxLength = 30) =>
    text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const getStatusStyle = (status) => {
    const statusStyles = {
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      skipped: "bg-blue-100 text-blue-500",
    };
    return statusStyles[status.toLowerCase()] || "bg-white text-gray-800";
  };

  const downloadExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // const handleCopyFeedback = (value, id) => {
  //   handleCopy(value, id);
  //   // Trigger feedback for the copied value
  //   alert(`Copied to clipboard: ${value}`);
  // };

  const handleDownloadRun = (run) => {
    const formattedData = run.executedTestCases.map((test) => ({
      TestRunId: run.testRunId,
      ProjectName: run.projectName,
      TotalTests: run.totalTests,
      Passed: run.passed,
      Failed: run.failed,
      Blocked: run.blocked,
      Skipped: run.skipped,
      TestCaseId: test.testCaseId,
      TestCaseName: test.testCaseName,
      InputUrl: test.inputUrl,
      Method: test.method,
      Payload: test.payload,
      ActualResponseCode: test.actualResponseCode,
      Response: test.response,
      Status: test.status,
    }));
    downloadExcel(formattedData, `Test_Run_${run.testRunId}`);
  };

  const handleDownloadAll = () => {
    const allData = filteredRunData.flatMap((run) =>
      run.executedTestCases.map((test) => ({
        TestRunId: run.testRunId,
        ProjectName: run.projectName,
        TotalTests: run.totalTests,
        Passed: run.passed,
        Failed: run.failed,
        Blocked: run.blocked,
        Skipped: run.skipped,
        TestCaseId: test.testCaseId,
        TestCaseName: test.testCaseName,
        InputUrl: test.inputUrl,
        Method: test.method,
        Payload: test.payload,
        ActualResponseCode: test.actualResponseCode,
        Response: test.response,
        Status: test.status,
      }))
    );
    downloadExcel(allData, `All_Test_Runs`);
  };

  return (
    <div className="container mx-auto p-6 max-w-full ">
      <h1 className="text-3xl font-bold mb-6 text-start px-2 text-sky-800 animate-fade-in ">
        Executed Test Cases
      </h1>
      <div className="w-full h-px bg-gray-300 my-6" />
      {/* <div className="mb-6 flex items-center space-x-4 relative">
        <label htmlFor="project-select" className="font-semibold text-gray-900">
          Select Project:
        </label>
        <select
          id="project-select"
          name="project"
          value={selectedProject}
          onChange={handleProjectChange}
          className="p-2 border border-gray-300 rounded-md font-semibold text-gray-700"
        >
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option
              key={project.id || project.projectName}
              value={project.projectName}
            >
              {project.projectName}
            </option>
          ))}
        </select>

        {filteredRunData.length > 0 && (
          <div className="mb-6">
            <button
              className="bg-red-400 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700"
              onClick={handleDownloadAll}
            >
              Download All Runs
            </button>
          </div>
        )}
      </div> */}

      <div className="mb-6 flex items-center space-x-4 relative">
        <label htmlFor="project-select" className="font-semibold text-gray-900">
          Select Project:
        </label>
        <select
          id="project-select"
          name="project"
          value={selectedProject}
          onChange={handleProjectChange}
          className="p-2 border border-gray-300 rounded-md font-semibold text-gray-700"
        >
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option
              key={project.id || project.projectName}
              value={project.projectName}
            >
              {project.projectName}
            </option>
          ))}
        </select>

        {/* Positioned Button */}
        {filteredRunData.length > 0 && (
          <div className="absolute top-0 right-0 mb-6">
            <button
              className="bg-red-400 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700"
              onClick={handleDownloadAll}
            >
              Download All Runs
            </button>
          </div>
        )}
      </div>

      {isFiltering ? (
        <div className="flex justify-center items-center h-64">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            <p className="text-lg font-bold text-gray-700">
              Loading Test Runs...
            </p>
          </div>
        </div>
      ) : filteredRunData.length > 0 ? (
        <div className="overflow-auto rounded-lg shadow max-w-full">
          <table className="min-w-full w-full bg-white border-collapse">
            <thead className="bg-gradient-to-r from-cyan-950 to-sky-900 text-white border-b border-gray-300">
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
                <th className="p-3 text-center">Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredRunData.map((run) => (
                <React.Fragment key={run.testRunId}>
                  <tr
                    className={`cursor-pointer ${
                      expandedRows[run.testRunId] ? "bg-blue-50" : "bg-white"
                    } hover:bg-blue-100 border-b border-gray-200`}
                    onClick={() => toggleRow(run.testRunId)}
                  >
                    <td className="p-3 text-center border-r border-gray-200">
                      {expandedRows[run.testRunId] ? "▼" : "▶"}
                    </td>
                    <td className="p-3 text-center font-bold border-r border-gray-200">
                      {run.testRunId}
                    </td>
                    <td className="p-3 text-center font-semibold border-r border-gray-200">
                      {run.projectName}
                    </td>
                    <td className="p-3 text-center font-bold border-r border-gray-200">
                      {run.totalTests}
                    </td>
                    <td className="p-3 text-center font-bold text-green-600 border-r border-gray-200">
                      {run.passed}
                    </td>
                    <td className="p-3 text-center font-bold text-red-600 border-r border-gray-200">
                      {run.failed}
                    </td>
                    <td className="p-3 text-center font-bold text-blue-600 border-r border-gray-200">
                      {run.blocked}
                    </td>
                    <td className="p-3 font-bold text-center">{run.skipped}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDownloadRun(run)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                  {expandedRows[run.testRunId] && (
                    <tr key={`${run.testRunId}-expanded`}>
                      <td colSpan="8" className="p-2 bg-gray-50">
                        <div className="overflow-auto rounded-lg shadow-inner bg-white">
                          <table className="min-w-full bg-white border border-gray-300">
                            <thead className="bg-gradient-to-r from-cyan-700 to-sky-800 text-white">
                              <tr>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Test ID
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Test Case Name
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Input Request URL
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Method
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Payload
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Actual Response
                                </th>
                                <th className="p-2 text-center border-r border-gray-300">
                                  Response
                                </th>
                                <th className="p-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {run.executedTestCases.map((test) => (
                                <tr
                                  key={`${run.testRunId}-${test.testCaseId}`}
                                  className={`hover:bg-gray-50 border-b text-black border-gray-300 ${getStatusStyle(
                                    test.status
                                  )}`}
                                >
                                  {/* Test Case ID */}
                                  <td className="p-2 font-bold text-center border-r border-gray-300">
                                    {test.testCaseId}
                                  </td>

                                  {/* Test Case Name */}
                                  <td className="p-2 font-bold text-center border-r border-gray-300">
                                    {test.testCaseName}
                                  </td>

                                  {/* Input URL */}
                                  <td className="p-2 text-center border-r border-gray-300">
                                    <div className="flex justify-center items-center space-x-2">
                                      <span
                                        onClick={() =>
                                          handleExpandContent(test.inputUrl)
                                        }
                                        className="cursor-pointer hover:underline"
                                        title={test.inputUrl}
                                      >
                                        {truncateText(test.inputUrl)}
                                      </span>
                                      <div
                                        onClick={() =>
                                          handleCopyFeedback(
                                            test.inputUrl,
                                            `${run.testRunId}-${test.testCaseId}-url`
                                          )
                                        }
                                        className="cursor-pointer text-gray-500 hover:text-gray-800"
                                        title="Copy URL"
                                        aria-label="Copy URL"
                                      >
                                        <ClipboardIcon className="w-4 h-4 inline-block" />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Method */}
                                  <td className="p-2 text-center border-r border-gray-300">
                                    {test.method}
                                  </td>

                                  {/* Payload */}
                                  <td className="p-2 text-center border-r border-gray-300">
                                    <div className="flex justify-center items-center space-x-2">
                                      <span
                                        onClick={() =>
                                          handleExpandContent(
                                            test.payload || "N/A"
                                          )
                                        }
                                        className="cursor-pointer hover:underline"
                                        title={test.payload || "N/A"}
                                      >
                                        {truncateText(test.payload || "N/A")}
                                      </span>
                                      <div
                                        onClick={() =>
                                          handleCopyFeedback(
                                            test.payload || "N/A",
                                            `${run.testRunId}-${test.testCaseId}-payload`
                                          )
                                        }
                                        className="cursor-pointer text-gray-500 hover:text-gray-800"
                                        title="Copy Payload"
                                        aria-label="Copy Payload"
                                      >
                                        <ClipboardIcon className="w-4 h-4 inline-block" />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Actual Response Code */}
                                  <td className="p-2 text-center border-r border-gray-300">
                                    {test.actualResponseCode || "N/A"}
                                  </td>

                                  {/* Response Code */}
                                  <td className="p-2 text-center border-r border-gray-300">
                                    {test.response == [] ? (
                                      "N/A"
                                    ) : (
                                      <button
                                        onClick={() =>
                                          setSelectedPayload(
                                            test.response || "N/A"
                                          )
                                        }
                                        className="text-blue-600 underline hover:text-blue-800"
                                      >
                                        View Response
                                      </button>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="p-2 text-center font-semibold">
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
      ) : (
        <div className="text-center text-gray-600 font-bold">
          No test runs available.
        </div>
      )}

      {expandedContent && (
        <div
          id="modal-background"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeExpandedContent}
        >
          <div
            className="bg-white p-6 rounded-lg shadow max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Expanded Content</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {expandedContent}
            </pre>
            <div className="flex justify-end items-center mt-4 space-x-4">
              {/* Copy Button */}
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none"
                onClick={() => {
                  navigator.clipboard.writeText(expandedContent);
                  alert("Copied to clipboard!");
                }}
              >
                Copy
              </button>
              {/* Close Button */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none"
                onClick={closeExpandedContent}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payload Modal */}
      {selectedPayload && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 overflow-auto hide-scrollbar"
          onClick={() => setSelectedPayload(null)}
        >
          <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-bold mb-4">Details</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {selectedPayload}
            </pre>
            <div className="flex justify-between items-center mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => {
                  navigator.clipboard.writeText(selectedPayload);
                  toast.success("Copied to clipboard!", {
                    // position: toast.POSITION.TOP_RIGHT,
                    autoClose: 4000,
                    theme: "light",
                  });
                  // alert("Copied to clipboard!");
                }}
              >
                Copy
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setSelectedPayload(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunTestCaseTable;
