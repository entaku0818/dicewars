import React, { useEffect, useState } from 'react';
import './DebugPanel.css';

interface LogEntry {
  message: string;
  timestamp: number;
}

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // console.logをインターセプト
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-50), { 
        message, 
        timestamp: Date.now() 
      }]);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className={`debug-panel ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="debug-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide' : 'Show'} Debug
      </button>
      
      {isOpen && (
        <div className="debug-content">
          <button 
            className="clear-logs" 
            onClick={() => setLogs([])}
          >
            Clear
          </button>
          <div className="log-entries">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <pre className="log-message">{log.message}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;