# snb
> Based on jquery's basic class library, the most common and convenient ways to provide the front end are available.

[![GitHub issues](https://img.shields.io/github/issues/cherislive/snb.svg)](https://github.com/cherislive/snb/issues)
[![GitHub forks](https://img.shields.io/github/forks/cherislive/snb.svg)](https://github.com/cherislive/snb/network)
[![GitHub stars](https://img.shields.io/github/stars/cherislive/snb.svg)](https://github.com/cherislive/snb/stargazers)
[![Version](https://img.shields.io/npm/v/snb.svg)](https://www.npmjs.com/package/snb)
[![Download](https://img.shields.io/npm/dm/snb.svg)](https://www.npmjs.com/package/snb)

[![NPM](https://nodei.co/npm/snb.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/snb/)


## Install
```
npm install snb -S
```

## Quick Start
```
import 'snb'
import 'snb/snb.css'
```

## Config
> SNB need a configuration file 'snb.config.js' and the file of "snb.config.js" is required.

> The "snb.config.js" file is downloaded and configured as the first visit to the page, and the config will be cached forever, unless the version number in "snb.js" is changed again. You can also load "snb.config" behind "snb.js", but it is not recommended to do so.

You can use these four methods：

 **1、 direct entry**
```
<script src="{your path}/snb.config.js"></script>
```

 **2、 auto entry**
The plugin automatically introduces the "snb.config.js" file according to the path of the first js file.
```
// Automatically load the '{your path}/snb.config.js' file
<script src="{your path}/{your js file}.js"></script>
```

**3、 configuration parameter**
The plug-in looks for the "snb-main" js file and gets the "snb-main" or "SRC" path of the js file to introduce the "snb.config.js" file.
```
// Automatically load the '{your path}/snb.config.js' file
<script snb-main src="{your path}/{your js file}.js"></script>

// Automatically load the '{setting path}/snb.config.js' file
<script snb-main="{setting path}" src="{your path}/{your js file}.js"></script>
```


**4、 Manual configuration parameter**
```
<script>
snb.config.baseUrl = ''
</script>
```

## Browser Support
Modern browsers and Internet Explorer 8+.

## How To Use
[wiki](https://github.com/cherislive/snb/wiki)

## LICENSE

MIT