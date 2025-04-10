"use client";

import { FC, useMemo } from "react";
import { useHtmlData } from "@/pages/_hooks/use-html-data";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { useAlias } from "@/pages/_hooks/use-alias";
import { MorphLoadDataProps } from "@/pages/_lib/data-props";
import { Callout } from "@/pages/_components/ui/callout";

type EmbedProps = {
  width?: number | string;
  height?: number | string;
};

const Embed: FC<MorphLoadDataProps & EmbedProps> = (props) => {
  const {
    alias,
    loadData,
    loadDataUrl = (loadData: string) =>
      `${window.location.protocol}//${window.location.host}/cli/run/${loadData}/html`,
    // postData,
    variables = {},
    width = "100%",
    height = 500,
  } = props;

  const _loadData = useAlias({ loadData, alias });

  const { data, error, isLoading } = useHtmlData({
    loadData: _loadData,
    variables,
    loadDataUrl,
  });

  const htmlString = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const blob = new Blob(
      [
        `<html>
          <head></head>
          <body>${data.data}</body>
        </html>`,
      ],
      { type: "text/html" }
    );

    return URL.createObjectURL(blob);
  }, [data]);

  return error ? (
    <EmbedError error={error} height={height} width={width} />
  ) : (
    <>
      <iframe
        // srcが変わった時に再描画されるようにkeyを設定
        title="MorphEmbed"
        key={htmlString}
        width={width}
        height={height}
        src={htmlString}
      />
      {isLoading && (
        <LoadingSpinner className="h-4 w-4 text-gray-500 absolute top-2 left-2" />
      )}
    </>
  );
};

type EmbedCommonPorps = {
  height?: number | string;
  width?: number | string;
};

const blob = new Blob(
  [
    `<html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/destyle.css@1.0.15/destyle.css"
        />
      </head>
      <body><div><script>window.PlotlyConfig={MathJaxConfig:"local"}</script><script charset=utf-8 src=https://cdn.plot.ly/plotly-2.35.2.min.js></script><div class=plotly-graph-div id=980be6b7-6fff-4059-a5cc-cfb5eaf18a87 style=height:100%;width:100%></div><script>window.PLOTLYENV=window.PLOTLYENV||{},document.getElementById("980be6b7-6fff-4059-a5cc-cfb5eaf18a87")&&Plotly.newPlot("980be6b7-6fff-4059-a5cc-cfb5eaf18a87",[{alignmentgroup:"True",hovertemplate:"Category=%{x}<br>Y Axis=%{y}<extra></extra>",legendgroup:"",marker:{color:"#636efa",pattern:{shape:""}},name:"",offsetgroup:"",orientation:"v",showlegend:!1,textposition:"auto",x:["A","B","C"],xaxis:"x",y:[.47639858654107337,.4904209303692657,.5314829741213475],yaxis:"y",type:"bar"}],{template:{data:{histogram2dcontour:[{type:"histogram2dcontour",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],choropleth:[{type:"choropleth",colorbar:{outlinewidth:0,ticks:""}}],histogram2d:[{type:"histogram2d",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],heatmap:[{type:"heatmap",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],heatmapgl:[{type:"heatmapgl",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],contourcarpet:[{type:"contourcarpet",colorbar:{outlinewidth:0,ticks:""}}],contour:[{type:"contour",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],surface:[{type:"surface",colorbar:{outlinewidth:0,ticks:""},colorscale:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]]}],mesh3d:[{type:"mesh3d",colorbar:{outlinewidth:0,ticks:""}}],scatter:[{fillpattern:{fillmode:"overlay",size:10,solidity:.2},type:"scatter"}],parcoords:[{type:"parcoords",line:{colorbar:{outlinewidth:0,ticks:""}}}],scatterpolargl:[{type:"scatterpolargl",marker:{colorbar:{outlinewidth:0,ticks:""}}}],bar:[{error_x:{color:"#2a3f5f"},error_y:{color:"#2a3f5f"},marker:{line:{color:"#E5ECF6",width:.5},pattern:{fillmode:"overlay",size:10,solidity:.2}},type:"bar"}],scattergeo:[{type:"scattergeo",marker:{colorbar:{outlinewidth:0,ticks:""}}}],scatterpolar:[{type:"scatterpolar",marker:{colorbar:{outlinewidth:0,ticks:""}}}],histogram:[{marker:{pattern:{fillmode:"overlay",size:10,solidity:.2}},type:"histogram"}],scattergl:[{type:"scattergl",marker:{colorbar:{outlinewidth:0,ticks:""}}}],scatter3d:[{type:"scatter3d",line:{colorbar:{outlinewidth:0,ticks:""}},marker:{colorbar:{outlinewidth:0,ticks:""}}}],scattermapbox:[{type:"scattermapbox",marker:{colorbar:{outlinewidth:0,ticks:""}}}],scatterternary:[{type:"scatterternary",marker:{colorbar:{outlinewidth:0,ticks:""}}}],scattercarpet:[{type:"scattercarpet",marker:{colorbar:{outlinewidth:0,ticks:""}}}],carpet:[{aaxis:{endlinecolor:"#2a3f5f",gridcolor:"white",linecolor:"white",minorgridcolor:"white",startlinecolor:"#2a3f5f"},baxis:{endlinecolor:"#2a3f5f",gridcolor:"white",linecolor:"white",minorgridcolor:"white",startlinecolor:"#2a3f5f"},type:"carpet"}],table:[{cells:{fill:{color:"#EBF0F8"},line:{color:"white"}},header:{fill:{color:"#C8D4E3"},line:{color:"white"}},type:"table"}],barpolar:[{marker:{line:{color:"#E5ECF6",width:.5},pattern:{fillmode:"overlay",size:10,solidity:.2}},type:"barpolar"}],pie:[{automargin:!0,type:"pie"}]},layout:{autotypenumbers:"strict",colorway:["#636efa","#EF553B","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"],font:{color:"#2a3f5f"},hovermode:"closest",hoverlabel:{align:"left"},paper_bgcolor:"white",plot_bgcolor:"#E5ECF6",polar:{bgcolor:"#E5ECF6",angularaxis:{gridcolor:"white",linecolor:"white",ticks:""},radialaxis:{gridcolor:"white",linecolor:"white",ticks:""}},ternary:{bgcolor:"#E5ECF6",aaxis:{gridcolor:"white",linecolor:"white",ticks:""},baxis:{gridcolor:"white",linecolor:"white",ticks:""},caxis:{gridcolor:"white",linecolor:"white",ticks:""}},coloraxis:{colorbar:{outlinewidth:0,ticks:""}},colorscale:{sequential:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]],sequentialminus:[[0,"#0d0887"],[.1111111111111111,"#46039f"],[.2222222222222222,"#7201a8"],[.3333333333333333,"#9c179e"],[.4444444444444444,"#bd3786"],[.5555555555555556,"#d8576b"],[.6666666666666666,"#ed7953"],[.7777777777777778,"#fb9f3a"],[.8888888888888888,"#fdca26"],[1,"#f0f921"]],diverging:[[0,"#8e0152"],[.1,"#c51b7d"],[.2,"#de77ae"],[.3,"#f1b6da"],[.4,"#fde0ef"],[.5,"#f7f7f7"],[.6,"#e6f5d0"],[.7,"#b8e186"],[.8,"#7fbc41"],[.9,"#4d9221"],[1,"#276419"]]},xaxis:{gridcolor:"white",linecolor:"white",ticks:"",title:{standoff:15},zerolinecolor:"white",automargin:!0,zerolinewidth:2},yaxis:{gridcolor:"white",linecolor:"white",ticks:"",title:{standoff:15},zerolinecolor:"white",automargin:!0,zerolinewidth:2},scene:{xaxis:{backgroundcolor:"#E5ECF6",gridcolor:"white",linecolor:"white",showbackground:!0,ticks:"",zerolinecolor:"white",gridwidth:2},yaxis:{backgroundcolor:"#E5ECF6",gridcolor:"white",linecolor:"white",showbackground:!0,ticks:"",zerolinecolor:"white",gridwidth:2},zaxis:{backgroundcolor:"#E5ECF6",gridcolor:"white",linecolor:"white",showbackground:!0,ticks:"",zerolinecolor:"white",gridwidth:2}},shapedefaults:{line:{color:"#2a3f5f"}},annotationdefaults:{arrowcolor:"#2a3f5f",arrowhead:0,arrowwidth:1},geo:{bgcolor:"white",landcolor:"#E5ECF6",subunitcolor:"white",showland:!0,showlakes:!0,lakecolor:"white"},title:{x:.05},mapbox:{style:"light"}}},xaxis:{anchor:"y",domain:[0,1],title:{text:"Category"}},yaxis:{anchor:"x",domain:[0,1],title:{text:"Values"}},legend:{tracegroupgap:0},title:{text:"Sample Chart"},barmode:"relative"},{modeBarButtonsToRemove:["zoom","pan","select","zoomIn","zoomOut","autoScale","resetScale","lasso2d"],displaylogo:!1,responsive:!0})</script></div></body>
    </html>`,
  ],
  { type: "text/html" }
);

const htmlString = URL.createObjectURL(blob);

export const EmbedError: FC<EmbedCommonPorps & { error: Error }> = (props) => {
  const { height, width, error } = props;
  return (
    <div
      className="relative"
      style={{
        height,
        width,
      }}
    >
      <iframe
        className="opacity-60"
        // srcが変わった時に再描画されるようにkeyを設定
        key={htmlString}
        width={width}
        height={height}
        src={htmlString}
      />
      <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
        <Callout
          title="An error occured with Embed comopnent."
          className="shadow-lg"
          variant="error"
        >
          <div className="mt-3">Error Message: {error.message}</div>
        </Callout>
      </div>
    </div>
  );
};

export { Embed };
