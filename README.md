# snb

基于jquery的基础类库 提供前端所需要的常用便捷方法。

## Install
```
npm install snb -S
```

## Quick Start
```
import 'snb'
import 'snb/src/snb.css'
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