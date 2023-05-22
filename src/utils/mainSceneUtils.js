export function createWinnerGroup(scene, images, imageSize, container) {
  const group = scene.add.group().addMultiple(
    images.map((texture, index) => {


      const img = scene.add.image(
        imageSize / 2,
        - imageSize / 2 ,
        'symbols', texture
      );



      img.displayWidth = imageSize;
      img.displayHeight = imageSize;
      container.add(img);
      return img;
    })
  );

  return group;
}

export function createMask(scene, x, y, width, height) {
  const shape = scene.make.graphics();

  shape.fillStyle(0xffffff);
  shape.fillRect(x, y, width, height);
  return shape.createGeometryMask();
}

export function createGroup(scene, images, imageSize, container) {
  const group = scene.add.group().addMultiple(

    images.map((texture, index) => {

      const img = scene.add.image(
        imageSize / 2,
        imageSize / 2 + imageSize + imageSize * index,
        'symbols', texture
      );
      img.displayWidth = imageSize;
      img.displayHeight = imageSize;

      container.add(img);


      return img;
    })

  );

  return group;
}

