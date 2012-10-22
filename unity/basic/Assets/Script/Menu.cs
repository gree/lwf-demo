using UnityEngine;
using System.Collections;

public class Menu : LWFObject {
	
	void Start()
	{
		setLoader();
		// #1 Show popup lwf/textures
		Load("menu.lwfdata/menu", "menu.lwfdata/");
	}
	
	
	void setLoader()
	{
		LWFObject.SetLoader(
			lwfDataLoader:(name) => {
				TextAsset asset = Resources.Load(name) as TextAsset;
				if (asset == null) {
					return null;
				}
				return asset.bytes;
			},
			textureLoader:(name) => {
				Texture2D texture = Resources.Load(name) as Texture2D;
				if (texture == null) {
					return null;
				}
				return texture;
			}
		);
	}
}
