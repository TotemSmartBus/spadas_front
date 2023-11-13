# Spadas Project

## Spadas front-end Project

### About the project

This is a project focus on explore the spatial datasets on the earth.

We provide an interactive web user interface for users to query datasets on the map and **search related datasets easily**.


### About Us

We are dataset management group from [Sheng's Group](http://sheng.whu.edu.cn/group.html). Our aims including spatial dataset augmentation, spatial dataset search, spatial dataset system benchmark and so on.

If you are interested about our project, please contact us from the homepage: [http://sheng.whu.edu.cn](http://sheng.whu.edu.cn) or [Email Us](mailto://shengcs@whu.edu.cn).


### How to Run

1. Install the dependencies by yarn

``` bash
yarn install
```

2. Run the project in development mode

``` bash
yarn run dev
```

3. Package the project to static resource directory

``` bash
yarn run build
```


### GuideLine

This project contains 3 main component: `SpadasHeader`, `SpadasContent` and  `SpadasFooter`, `SpadasContent` has `OptionPanel` and `SpadasMap` 2 parts.

![截屏2023-10-26 21.46.44](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E6%88%AA%E5%B1%8F2023-10-26%2021.46.44.png)



Map is the kernel component in this application.




#### Map Component



Design:

1. Point Layer
2. Trajectory Layer
3. Roadmap Layer



Or Multi layer design, use a chain render order.
