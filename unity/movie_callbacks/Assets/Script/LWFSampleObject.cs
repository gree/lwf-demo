using UnityEngine;
using LWF;
public class LWFSampleObject : LWFObject {
	
	private string message = "";
	
	void Start()
	{
		// directory name that contains lwf(.bytes) and png textures
		// e.g. attach_movies_from_library.lwfdata/
		// NOTE: the '/' in the end of path is mandatory for texturePrefix
		string dir = string.Format("{0}.lwfdata/", name);
		
		// path to lwf(.bytes) without extension
		// e.g. attach_movies_from_library.lwfdata/attach_movies_from_library
		string path = dir + name;
		
		
		Load(
			path:path, 
			texturePrefix:dir,
			lwfLoadCallback:load_callback // lwfLoadCallback is fired when lwf is readay. 
			);
		
		// NOTE:
		// Touching LWFObject.lwf right after "Load" is dangerous because loading lwf might not be completed.
		// Use lwfLoadCallback instead of.

		
	}
	
	
	void load_callback(LWFObject lwfobject)
	{
		// Add callback for fscommand("event", "end_of_frame")  
		lwfobject.AddEventHandler("end_of_frame", end_of_frame_callback );
	}
	
	
	void end_of_frame_callback(Movie movie, Button button)
	{
		// Called when fscommand("event", "end_of_frame") is fired.
		message += "end_of_frame_callback is called \n";
	}
	
	void OnGUI()
	{
		GUILayout.Box( message );
	}
}
