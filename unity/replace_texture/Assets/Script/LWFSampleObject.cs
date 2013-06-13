using UnityEngine;
using LWF;
using System.Collections.Generic;
public class LWFSampleObject : LWFObject {
	
	List<string> cached_textures = null;
	
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
			texturePrefix:dir
			);
		
		// NOTE:
	}
	
	void OnGUI()
	{
		// Show cache contents
		if ( GUILayout.Button("Show cache contents") )
		{
			var cache = LWF.UnityRenderer.ResourceCache.SharedInstance().textureCache;
			if (cache != null) {
				cached_textures = new List<string>();
				foreach (string key in cache.Keys){
					cached_textures.Add(key);
				}
			}
		}
		
		// Button to replace image
		if ( cached_textures != null ) {
			foreach ( string texture_name in cached_textures){
				if ( GUILayout.Button( texture_name ) ){
					replace( texture_name );
				}
			}
		}
	
	}
	
	void replace( string texture_name )
	{
		var cache = LWF.UnityRenderer.ResourceCache.SharedInstance().textureCache;
		if (cache != null) {

		    if (cache.ContainsKey(texture_name)) {
		        var cache_item = cache[texture_name];
		        var tex_context = cache_item.Entity();
				
		        tex_context.material.mainTexture = Resources.Load("textures/_jump_cat_jump0001") as Texture2D;
		    }
		}
	}
}
