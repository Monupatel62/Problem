/**
 * Utility to generate clean starter code skeletons (stubs)
 * from full solutions for JavaScript, TypeScript, Python, C++, C, Java, Go, Rust, Kotlin, Ruby, PHP, and C#.
 */
export function generateStub(code: string, language: string, functionName: string): string {
  if (!code) return "";

  const trimmed = code.trim();

  if (language === "SQL") {
    return "-- Write your SQL query here\nSELECT";
  }

  if (language === "Bash") {
    return "#!/bin/bash\n# Write your solution here\n";
  }

  if (language === "JavaScript") {
    // If it's a standard function
    const funcMatch = trimmed.match(new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`));
    if (funcMatch) {
      return `${funcMatch[0]}\n  // Write your code here\n}`;
    }
    // If it's a class definition (e.g. class Foo)
    if (trimmed.includes("class Foo")) {
      return `class Foo {\n  first(printFirst) {\n    // Write your code here\n  }\n  second(printSecond) {\n    // Write your code here\n  }\n  third(printThird) {\n    // Write your code here\n  }\n}`;
    }
    return `function ${functionName}() {\n  // Write your code here\n}`;
  }

  if (language === "Python") {
    const lines = trimmed.split("\n");
    const resultLines: string[] = [];
    let insideMethod = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("class ") || line.startsWith("import ") || line.startsWith("from ")) {
        resultLines.push(line);
      } else if (trimmedLine.startsWith("def ")) {
        resultLines.push(line);
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "";
        resultLines.push(`${indent}    # Write your code here\n${indent}    pass`);
        insideMethod = true;
      } else if (insideMethod) {
        if (trimmedLine === "" || line.startsWith("    ") || line.startsWith("\t")) {
          // skip method body
        } else {
          insideMethod = false;
          resultLines.push(line);
        }
      } else {
        resultLines.push(line);
      }
    }
    return resultLines.join("\n");
  }

  if (language === "C++") {
    const lines = trimmed.split("\n");
    const resultLines: string[] = [];
    let insideMethod = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.includes(`${functionName}(`) || (trimmedLine.includes(` ${functionName} `) && trimmedLine.includes("("))) {
        resultLines.push(line);
        let hasBrace = line.includes("{");
        let nextIdx = i;
        while (!hasBrace && nextIdx + 1 < lines.length) {
          nextIdx++;
          const nextLine = lines[nextIdx];
          resultLines.push(nextLine);
          if (nextLine.includes("{")) {
            hasBrace = true;
          }
        }
        i = nextIdx;
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "    ";
        resultLines.push(`${indent}    // Write your code here\n`);
        insideMethod = true;
        braceCount = 1;
      } else if (insideMethod) {
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        if (braceCount <= 0) {
          insideMethod = false;
          resultLines.push(line);
        }
      } else {
        resultLines.push(line);
      }
    }
    return resultLines.join("\n");
  }

  if (language === "Java") {
    const lines = trimmed.split("\n");
    const resultLines: string[] = [];
    let insideMethod = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.includes(`${functionName}(`)) {
        resultLines.push(line);
        let hasBrace = line.includes("{");
        let nextIdx = i;
        while (!hasBrace && nextIdx + 1 < lines.length) {
          nextIdx++;
          const nextLine = lines[nextIdx];
          resultLines.push(nextLine);
          if (nextLine.includes("{")) {
            hasBrace = true;
          }
        }
        i = nextIdx;
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "    ";
        resultLines.push(`${indent}    // Write your code here\n`);
        insideMethod = true;
        braceCount = 1;
      } else if (insideMethod) {
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        if (braceCount <= 0) {
          insideMethod = false;
          resultLines.push(line);
        }
      } else {
        resultLines.push(line);
      }
    }
    return resultLines.join("\n");
  }

  if (language === "TypeScript") {
    const funcMatch = trimmed.match(new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*(:\\s*[^{]+)?\\s*\\{`));
    if (funcMatch) {
      return `${funcMatch[0]}\n  // Write your code here\n}`;
    }
    return `function ${functionName}(): void {\n  // Write your code here\n}`;
  }

  if (language === "Go") {
    const funcMatch = trimmed.match(new RegExp(`func\\s+${functionName}\\s*\\([^)]*\\)[^{]*\\{`));
    if (funcMatch) {
      return `${funcMatch[0]}\n    // Write your code here\n}`;
    }
    return `func ${functionName}() {\n    // Write your code here\n}`;
  }

  if (language === "Rust") {
    const snakeName = functionName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
    const funcMatch = trimmed.match(new RegExp(`fn\\s+${snakeName}\\s*\\([^)]*\\)\\s*(->[^{]+)?\\s*\\{`));
    if (funcMatch) {
      return `${funcMatch[0]}\n    // Write your code here\n}`;
    }
    return `fn ${snakeName}() {\n    // Write your code here\n}`;
  }

  if (language === "C") {
    const lines = trimmed.split("\n");
    const resultLines: string[] = [];
    let insideMethod = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.includes(`${functionName}(`) || (trimmedLine.includes(` ${functionName} `) && trimmedLine.includes("("))) {
        resultLines.push(line);
        let hasBrace = line.includes("{");
        let nextIdx = i;
        while (!hasBrace && nextIdx + 1 < lines.length) {
          nextIdx++;
          const nextLine = lines[nextIdx];
          resultLines.push(nextLine);
          if (nextLine.includes("{")) {
            hasBrace = true;
          }
        }
        i = nextIdx;
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "    ";
        resultLines.push(`${indent}    // Write your code here\n`);
        insideMethod = true;
        braceCount = 1;
      } else if (insideMethod) {
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        if (braceCount <= 0) {
          insideMethod = false;
          resultLines.push(line);
        }
      } else {
        resultLines.push(line);
      }
    }
    return resultLines.join("\n");
  }

  if (language === "Kotlin") {
    const funcMatch = trimmed.match(new RegExp(`fun\\s+${functionName}\\s*\\([^)]*\\)\\s*(:\\s*[^{]+)?\\s*\\{`));
    if (funcMatch) {
      return `${funcMatch[0]}\n    // Write your code here\n}`;
    }
    return `fun ${functionName}(): Unit {\n    // Write your code here\n}`;
  }

  if (language === "Ruby") {
    const snakeName = functionName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
    const defMatch = trimmed.match(new RegExp(`def\\s+${snakeName}\\s*\\(?[^)]*\\)?`));
    if (defMatch) {
      return `${defMatch[0]}\n  # Write your code here\nend`;
    }
    return `def ${snakeName}()\n  # Write your code here\nend`;
  }

  if (language === "PHP") {
    const funcMatch = trimmed.match(new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*(:\\s*[^{]+)?\\s*\\{`));
    if (funcMatch) {
      return `<?php\n${funcMatch[0]}\n    // Write your code here\n}`;
    }
    return `<?php\nfunction ${functionName}() {\n    // Write your code here\n}`;
  }

  if (language === "C#") {
    const lines = trimmed.split("\n");
    const resultLines: string[] = [];
    let insideMethod = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.includes(`${functionName}(`)) {
        resultLines.push(line);
        let hasBrace = line.includes("{");
        let nextIdx = i;
        while (!hasBrace && nextIdx + 1 < lines.length) {
          nextIdx++;
          const nextLine = lines[nextIdx];
          resultLines.push(nextLine);
          if (nextLine.includes("{")) {
            hasBrace = true;
          }
        }
        i = nextIdx;
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "    ";
        resultLines.push(`${indent}    // Write your code here\n`);
        insideMethod = true;
        braceCount = 1;
      } else if (insideMethod) {
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        if (braceCount <= 0) {
          insideMethod = false;
          resultLines.push(line);
        }
      } else {
        resultLines.push(line);
      }
    }
    return resultLines.join("\n");
  }

  return code;
}
