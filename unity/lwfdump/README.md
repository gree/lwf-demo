# lwfdump

converts an lwf to an image sequence (png files).

## Build

```bash
$ /Applications/Unity/Hub/Editor/2019.4.1f1/Unity.app/Contents/MacOS/Unity -quit -batchmode -nographics -projectPath `pwd` -buildTarget OSXUniversal -buildOSXUniversalPlayer `pwd`/lwfdump.app
```

## Usage

```
lwfdump.app/Contents/MacOS/lwfdump src.lwf num_of_frames dst_dir
```

### Example

```bash
$ ./lwfdump.app/Contents/MacOS/lwfdump example/input/animated_building.lwf 120 example/output
```
