using UnityEngine;
using System.Collections;

public class Simple : LWFObject {
	
	void Start()
	{
		setLoader();
		// #1 Show popup lwf/textures
		Load("gree_logo.lwfdata/gree_logo", "gree_logo.lwfdata/");
		

		/*
		// #2 Event handler.
		/// Show Window when the "OKPressEvent" is fired.
		lwf.SetEventHandler("OKPressEvent", (movie, button)=>{
			Load("Template/Window/Window.lwfdata/Window","Template/Window/Window.lwfdata/");
		});	
		
		lwf.SetEventHandler("DrawGachaEvent", (movie, button)=>{
			Application.OpenURL("www.google.com");
			//GameObject.CreatePrimitive(PrimitiveType.Cube);
		});
		
		
		lwf.SetEventHandler("PlayPressed", (movie, button)=>{
			Debug.Log("PlayPressed" );
			if ( SoundEffect != null ) {
				SoundEffect.audio.Play();
				tWhiteOut = lwf.rootMovie.AttachMovie( "White0", "WhiteOut" );
				tWhiteOut.ScaleTo( 640.0f, 940.0f );
				tWhiteOut.SetColorTransform( new LWF.ColorTransform(1.0f, 1.0f, 1.0f, 0.0f )) ;
			}
		});	
		
		*/
		
	}
	
	
	void setLoader()
	{
		LWFObject.SetLoader(
			lwfDataLoader:(name) => {
				//UnityEngine.Debug.Log(string.Format("Load LWF Data: {0}", name));
				TextAsset asset = Resources.Load(name) as TextAsset;
				if (asset == null) {
					return null;
				}
				return asset.bytes;
			},
			textureLoader:(name) => {
				//UnityEngine.Debug.Log(string.Format("Load Texture: {0}", name));
				Texture2D texture = Resources.Load(name) as Texture2D;
				if (texture == null) {
					return null;
				}
				return texture;
			}
		);


	}
}
