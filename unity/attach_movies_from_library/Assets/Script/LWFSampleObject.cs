using UnityEngine;

public class LWFSampleObject : LWFObject {
	
	private int attach_count = 0;
	
	void Start()
	{
		// directory name that contains lwf(.bytes) and png textures
		// e.g. attach_movies_from_library.lwfdata/
		// NOTE: the '/' in the end of path is mandatory for texturePrefix
		string dir = string.Format("{0}.lwfdata/", name);
		
		// path to lwf(.bytes) without extension
		// e.g. attach_movies_from_library.lwfdata/attach_movies_from_library
		string path = dir + name;
		
		// Load prefix
		Load(path:path, texturePrefix:dir);
		
	}
	
	void OnGUI()
	{
		if ( GUILayout.Button( "Attach movie from movie" )){
			if (lwf !=null){
				// The linkage named "gree" is instantiated and attached to root movie.
				LWF.Movie attached_movie = 
					lwf.rootMovie.AttachMovie(
						"gree", // Symbol's linkage name in library
						"attached_gree" + attach_count.ToString() // Attached movie name.
						// NOTE: Atttached movie name should unique. 
						// If duplicated name is specified , new instance is not created and existing instance is returned.
					);
				
				if ( attached_movie != null ){
					
					// Randomize position
					attached_movie.MoveTo( Random.Range(0, 500), Random.Range(0, 500)); 
					
					// Increament count for unique attached movie name.
					attach_count ++;	
				}
			}
		}
	}

}
