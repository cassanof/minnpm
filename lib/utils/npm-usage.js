const { dirname } = require('path')
const { cmdList } = require('./cmd-list')

module.exports = (npm) => {
  const usesBrowser = npm.config.get('viewer') === 'browser'
    ? ' (in a browser)' : ''
  return `maxnpm <command>

Usage:

maxnpm install        install all the dependencies in your project
maxnpm install <foo>  add the <foo> dependency to your project
maxnpm test           run this project's tests
maxnpm run <foo>      run the script named <foo>
maxnpm <command> -h   quick help on <command>
maxnpm -l             display usage info for all commands
maxnpm help <term>    search for help on <term>${usesBrowser}
maxnpm help npm       more involved overview${usesBrowser}

All commands:
${allCommands(npm)}

Specify configs in the ini-formatted file:
    ${npm.config.get('userconfig')}
or on the command line via: maxnpm <command> --key=value

More configuration info: maxnpm help config
Configuration fields: maxnpm help 7 config

maxnpm@${npm.version} ${dirname(dirname(__dirname))}`
}

const allCommands = (npm) => {
  if (npm.config.get('long'))
    return usages(npm)
  return ('\n    ' + wrap(cmdList))
}

const wrap = (arr) => {
  const out = ['']

  const line = !process.stdout.columns ? 60
    : Math.min(60, Math.max(process.stdout.columns - 16, 24))

  let l = 0
  for (const c of arr.sort((a, b) => a < b ? -1 : 1)) {
    if (out[l].length + c.length + 2 < line)
      out[l] += ', ' + c
    else {
      out[l++] += ','
      out[l] = c
    }
  }
  return out.join('\n    ').substr(2)
}

const usages = (npm) => {
  // return a string of <command>: <usage>
  let maxLen = 0
  return cmdList.reduce((set, c) => {
    set.push([c, npm.commands[c].usage])
    maxLen = Math.max(maxLen, c.length)
    return set
  }, [])
    .sort((a, b) => a[0].localeCompare(b[0], 'en'))
    .map(([c, usage]) => `\n    ${c}${' '.repeat(maxLen - c.length + 1)}${
      (usage.split('\n').join('\n' + ' '.repeat(maxLen + 5)))}`)
    .join('\n')
}
