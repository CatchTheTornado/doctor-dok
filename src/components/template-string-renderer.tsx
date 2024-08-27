import React, { useEffect, useState } from 'react';

const TemplateStringRenderer = ({ template, onChange }) => {
  const parseTemplate = (template) => {
    const regex = /\{(select|input|checkbox):([^}]+)\}/g;
    const segments = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(template)) !== null) {
      const [placeholder, type, options] = match;

      let choices = [];
      let defaultValue = '';
      let checkboxValues = [];

      if (type === 'select') {
        choices = options.split('|');
      } else if (type === 'input') {
        const parts = options.split('|');
        defaultValue = parts[0];
      } else if (type === 'checkbox') {
        checkboxValues = options.split('|'); // For checkbox, split values for checked and unchecked
      }

      // Push plain text before this placeholder
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: template.slice(lastIndex, match.index) });
      }

      // Push the select, input, or checkbox information
      segments.push({ type, options: choices, defaultValue, checkboxValues });

      lastIndex = regex.lastIndex;
    }

    // Push any remaining text after the last placeholder
    if (lastIndex < template.length) {
      segments.push({ type: 'text', content: template.slice(lastIndex) });
    }

    return segments;
  };

  const segments = parseTemplate(template);
  const [values, setValues] = useState(
    segments.map((segment) => {
      if (segment.type === 'select') return segment.options[0];
      if (segment.type === 'input') return segment.defaultValue || '';
      if (segment.type === 'checkbox') return false; // Initial state for checkboxes
      return null;
    })
  );

  const renderValues = (newValues: any[]) => {
    let combinedString = '';
    let segmentIndex = 0;
    segments.forEach((segment) => {
      if (segment.type === 'text') {
        combinedString += segment.content;
        segmentIndex += 1;
      } else if (segment.type === 'checkbox') {
        combinedString += newValues[segmentIndex]
          ? segment.checkboxValues[0]
          : segment.checkboxValues[1];
        segmentIndex += 1;
      } else {
        combinedString += newValues[segmentIndex];
        segmentIndex += 1;
      }
    });

    return combinedString;
  }

  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Combine the segments into the final string
    const combinedString = renderValues(newValues)
    if (onChange) {
      onChange(combinedString);
    }
  };

  useEffect(() => {
    const combinedString = renderValues(values);
    if (onChange) {
      onChange(combinedString);
    }

  }, []);
 

  return (
    <div>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        } else if (segment.type === 'select') {
          return (
            <select
              key={index}
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              style={{ margin: '0 5px' }}
            >
              {segment.options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else if (segment.type === 'input') {
          return (
            <input
              key={index}
              type="text"
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Enter value"
              style={{ margin: '0 5px' }}
            />
          );
        } else if (segment.type === 'checkbox') {
          return (
            <label key={index} style={{ margin: '0 5px' }}>
              <input
                type="checkbox"
                checked={values[index]}
                onChange={(e) => handleChange(index, e.target.checked)}
              />
              {segment.checkboxValues[0]} / {segment.checkboxValues[1]}
            </label>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default TemplateStringRenderer;