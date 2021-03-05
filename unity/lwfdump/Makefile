TARGET=lwfdump.app

build: clean
	version=`grep m_EditorVersion: ProjectSettings/ProjectVersion.txt | sed 's/m_EditorVersion: //'`; \
	/Applications/Unity/Hub/Editor/$$version/Unity.app/Contents/MacOS/Unity -quit -batchmode -nographics -projectPath `pwd` -buildTarget OSXUniversal -buildOSXUniversalPlayer `pwd`/$(TARGET)

clean:
	rm -rf $(TARGET)
