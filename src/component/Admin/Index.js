import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import { blue, green, red, yellow } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
    Description,
    Favorite,
    FileCopy,
    Forum,
    GitHub,
    Home,
    Launch,
    Lock,
    People,
    Public,
    Telegram,
} from "@material-ui/icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";
import TimeAgo from "timeago-react";
import { toggleSnackbar } from "../../redux/explorer";
import API from "../../middleware/Api";
import pathHelper from "../../utils/page";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(3),
        height: "100%",
    },
    logo: {
        width: 70,
    },
    logoContainer: {
        padding: theme.spacing(3),
        display: "flex",
    },
    title: {
        marginLeft: 16,
    },
    cloudreve: {
        fontSize: 25,
        color: theme.palette.text.secondary,
    },
    version: {
        color: theme.palette.text.hint,
    },
    links: {
        padding: theme.spacing(3),
    },
    iconRight: {
        minWidth: 0,
    },
    userIcon: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    fileIcon: {
        backgroundColor: yellow[100],
        color: yellow[800],
    },
    publicIcon: {
        backgroundColor: green[100],
        color: green[800],
    },
    secretIcon: {
        backgroundColor: red[100],
        color: red[800],
    },
}));

export default function Index() {
    const { t } = useTranslation("dashboard");
    const classes = useStyles();
    const [lineData, setLineData] = useState([]);
    const [news, setNews] = useState([]);
    const [newsUsers, setNewsUsers] = useState({});
    const [open, setOpen] = React.useState(false);
    const [siteURL, setSiteURL] = React.useState("");
    const [statistics, setStatistics] = useState({
        fileTotal: 0,
        userTotal: 0,
        publicShareTotal: 0,
        secretShareTotal: 0,
    });
    const [version, setVersion] = useState({
        backend: "-",
    });

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const ResetSiteURL = () => {
        setOpen(false);
        API.patch("/admin/setting", {
            options: [
                {
                    key: "siteURL",
                    value: window.location.origin,
                },
            ],
        })
            .then(() => {
                setSiteURL(window.location.origin);
                ToggleSnackbar("top", "right", t("settings.saved"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        API.get("/admin/summary")
            .then((response) => {
                const data = [];
                response.data.date.forEach((v, k) => {
                    data.push({
                        name: v,
                        file: response.data.files[k],
                        user: response.data.users[k],
                        share: response.data.shares[k],
                    });
                });
                setLineData(data);
                setStatistics({
                    fileTotal: response.data.fileTotal,
                    userTotal: response.data.userTotal,
                    publicShareTotal: response.data.publicShareTotal,
                    secretShareTotal: response.data.secretShareTotal,
                });
                setVersion(response.data.version);
                setSiteURL(response.data.siteURL);
                if (
                    response.data.siteURL === "" ||
                    response.data.siteURL !== window.location.origin
                ) {
                    setOpen(true);
                }
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });

    }, []);

    return (
        <Grid container spacing={3}>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t("summary.confirmSiteURLTitle")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography>
                            {siteURL === "" &&
                                t("summary.siteURLNotSet", {
                                    current: window.location.origin,
                                })}
                            {siteURL !== "" &&
                                t("summary.siteURLNotMatch", {
                                    current: window.location.origin,
                                })}
                        </Typography>
                        <Typography>
                            {t("summary.siteURLDescription")}
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="default">
                        {t("summary.ignore")}
                    </Button>
                    <Button onClick={() => ResetSiteURL()} color="primary">
                        {t("summary.changeIt")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid alignContent={"stretch"} item xs={12} md={8} lg={9}>
                <Paper className={classes.paper}>
                    <Typography variant="button" display="block" gutterBottom>
                        {t("summary.trend")}
                    </Typography>
                    <ResponsiveContainer
                        width="100%"
                        aspect={pathHelper.isMobile() ? 4.0 / 3.0 : 3.0 / 1.0}
                    >
                        <LineChart width={1200} height={300} data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                name={t("nav.files")}
                                type="monotone"
                                dataKey="file"
                                stroke="#3f51b5"
                            />
                            <Line
                                name={t("nav.users")}
                                type="monotone"
                                dataKey="user"
                                stroke="#82ca9d"
                            />
                            <Line
                                name={t("nav.shares")}
                                type="monotone"
                                dataKey="share"
                                stroke="#e91e63"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
                <Paper className={classes.paper}>
                    <Typography variant="button" display="block" gutterBottom>
                        {t("summary.summary")}
                    </Typography>
                    <Divider />
                    <List className={classes.root}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar className={classes.userIcon}>
                                    <People />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={statistics.userTotal}
                                secondary={t("summary.totalUsers")}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar className={classes.fileIcon}>
                                    <FileCopy />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={statistics.fileTotal}
                                secondary={t("summary.totalFiles")}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar className={classes.publicIcon}>
                                    <Public />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={statistics.publicShareTotal}
                                secondary={t("summary.publicShares")}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar className={classes.secretIcon}>
                                    <Lock />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={statistics.secretShareTotal}
                                secondary={t("summary.privateShares")}
                            />
                        </ListItem>
                    </List>
                </Paper>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <Paper>
                    <div className={classes.logoContainer}>
                        <img
                            alt="MINIYUN"
                            className={classes.logo}
                            src={"/static/img/miniyun.svg"}
                        />
                        <div className={classes.title}>
                            <Typography className={classes.cloudreve}>
                                Cloudreve
                            </Typography>
                            <Typography className={classes.version}>
                                {version.backend}{" "}
                                {version.is_pro === "true" && (
                                    <Chip size="small" label="Pro" />
                                )}
                            </Typography>
                        </div>
                    </div>
                </Paper>
            </Grid>
        </Grid>
    );
}
