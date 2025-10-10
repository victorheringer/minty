/**
 * Mock implementation for fs/promises module
 * Used to simulate file system operations in tests
 */

export const fs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  mkdir: jest.fn(),
  rm: jest.fn(),
  access: jest.fn(),
  copyFile: jest.fn()
};

// Mock data for common scenarios
export const mockFiles = {
  validJson: '{"name": "test", "data": [1, 2, 3]}',
  invalidJson: '{"invalid": json}',
  htmlTemplate: '<html>{{title}}</html>',
  cssTemplate: '.class { color: {{color}}; }',
  jsTemplate: 'const value = "{{value}}";',
  configFile: '{"templates": "templates", "output": "build", "data": "data.json"}',
  partialTemplate: 'Header: @header\nContent: {{content}}\nFooter: @footer'
};

// Mock file system structure
export const mockFileStructure = {
  'templates/index.html': mockFiles.htmlTemplate,
  'templates/style.css': mockFiles.cssTemplate,
  'templates/script.js': mockFiles.jsTemplate,
  'templates/partials/header.html': '<header>{{siteName}}</header>',
  'templates/partials/footer.html': '<footer>{{year}}</footer>',
  'data.json': mockFiles.validJson,
  '.mintyrc': mockFiles.configFile
};

// Helper to setup file system mocks
export function setupFsMocks() {
  fs.readFile.mockImplementation((path) => {
    const pathStr = path.toString();
    if (mockFileStructure[pathStr]) {
      return Promise.resolve(mockFileStructure[pathStr]);
    }
    const error = new Error(`ENOENT: no such file or directory, open '${pathStr}'`);
    error.code = 'ENOENT';
    return Promise.reject(error);
  });

  fs.writeFile.mockResolvedValue();
  fs.mkdir.mockResolvedValue();
  fs.rm.mockResolvedValue();
  fs.copyFile.mockResolvedValue();

  fs.readdir.mockImplementation((path) => {
    const pathStr = path.toString();
    if (pathStr === 'templates') {
      return Promise.resolve([
        { name: 'index.html', isDirectory: () => false },
        { name: 'style.css', isDirectory: () => false },
        { name: 'script.js', isDirectory: () => false },
        { name: 'partials', isDirectory: () => true }
      ]);
    }
    if (pathStr === 'templates/partials') {
      return Promise.resolve([
        { name: 'header.html', isDirectory: () => false },
        { name: 'footer.html', isDirectory: () => false }
      ]);
    }
    return Promise.resolve([]);
  });

  fs.stat.mockImplementation((path) => {
    const pathStr = path.toString();
    return Promise.resolve({
      isDirectory: () => pathStr.includes('partials') && !pathStr.includes('.'),
      isFile: () => !pathStr.includes('partials') || pathStr.includes('.')
    });
  });

  fs.access.mockResolvedValue();
}

// Reset all mocks
export function resetFsMocks() {
  Object.values(fs).forEach(mock => mock.mockReset());
}