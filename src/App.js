import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import 'typeface-roboto';
import axios from 'axios';
import moment from 'moment';

import clsx from 'clsx';
import {lighten, makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';

function getAttendance() {
  return axios.get('/api/attendance').then(res => res.data);
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    console.log('Loading attendance');
    getAttendance()
      .then(result => {
        setPlayers(result);
        setLoaded(true);
      });
  }, []);

  const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });

  const classes = useStyles();

  const rows = players.map(player => {
    const {name, raids = []} = player;
    return {name, raids};
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Warcraft Logs Attendance
        </p>
      </header>

      Last 30 days based on logged raids

      {!loaded && <p>Loading...</p>}
      {loaded &&
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Attendance</TableCell>
              <TableCell>Raids</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.raids.length}</TableCell>
                <TableCell align="left">{row.raids.map(({title}) => title).join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      }
    </div>
  );
}

export default App;
