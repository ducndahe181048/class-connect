import React from 'react';
import { FaDownload } from 'react-icons/fa';
import '../../css/SubmissionList/FilesList.css';

const FilesList = ({ files, onDownload }) => {
    if (!files || files.length === 0) {
        return <span>Không có tệp</span>;
    }

    return (
        <div className="files-list">
            {files.map(file => (
                <div key={file._id} className="file-item">
                    <span>{file.originalName}</span>
                    <button
                        className="download-button"
                        onClick={() => onDownload(file._id, file.originalName)}
                    >
                        <FaDownload />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FilesList;