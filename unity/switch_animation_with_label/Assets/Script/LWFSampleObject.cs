using UnityEngine;
using LWF;
using System;
using System.Collections.Generic;

public class LWFSampleObject : LWFObject {
	
	string linkage_name = "character";
	List<Movie> attached_movies = new List<Movie>();
	
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
		if ( GUILayout.Button( "Attach movie from library sprite" )){
			if (lwf !=null){
				// The linkage named "gree" is instantiated and attached to root movie.
				LWF.Movie attached_movie = 
					lwf.rootMovie.AttachMovie(
						linkage_name, // Symbol's linkage name in library
						linkage_name + attached_movies.Count.ToString() // Attached movie name.
						// NOTE: Atttached movie name should unique. 
						// If duplicated name is specified , new instance is not created and existing instance is returned.
					);
				
				if ( attached_movie != null ){
					
					attached_movies.Add( attached_movie );
					
					// Randomize position
					attached_movie.MoveTo( 
						UnityEngine.Random.Range(0, 500), 
						UnityEngine.Random.Range(0, 500)); 
					
				}
			}
		}
		
		// Go to "action"
		if ( GUILayout.Button( "action" )){
			foreach( Movie attached_movie in attached_movies){
				attached_movie.GotoLabel("action");
				attached_movie.Play();
			}
		}
		
		// Go back to "start"
		if ( GUILayout.Button( "start" )){
			foreach( Movie attached_movie in attached_movies){
				attached_movie.GotoLabel("start");
				attached_movie.Play();
			}
		}
	}
	
}
