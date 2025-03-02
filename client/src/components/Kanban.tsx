import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Paper, TextField, Button, Box } from '@mui/material/';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

interface Column {
  _id: string;
  name: string;
  tickets: { _id: string; name: string }[];
}

const Kanban = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTicketName, setNewTicketName] = useState<{ [key: string]: string }>({});

  // Fetch columns & tickets
  const fetchColumns = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/columns/${boardId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Error fetching columns');
      }
      const columnData = await response.json();
      const columnsList = columnData.columns;
      const columnsWithTickets = await Promise.all(
        columnsList.map(async (column: Column) => {
          const ticketResponse = await fetch(`http://localhost:3000/api/tickets/${column._id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'Content-type': 'application/json' },
          });
          if (!ticketResponse.ok) {
            throw new Error('Error fetching tickets');
          }
          const ticketData = await ticketResponse.json();
          const ticketsList = ticketData.tickets;

          return { ...column, tickets: ticketsList };
        })
      );
      setColumns(columnsWithTickets);
    } catch (error) {
      console.log(`Error fetching columns, ${error.message}`);
    }
  };
  // useEffect that calls fetchColumns when boardId is updated
  useEffect(() => {
    fetchColumns();
  }, [boardId]);

  // Create a new column
  const createColumn = async () => {
    if (!newColumnName.trim()) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/columns', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newColumnName, boardId: boardId }),
      });
      if (!response.ok) {
        throw new Error('Error creating column');
      }
      const newColumn: Column = await response.json();
      setColumns([...columns, newColumn]);
      fetchColumns();
      setNewColumnName('');
    } catch (error) {
      console.log(`Error creating column, ${error.message}`);
    }
  };

  // Create a new ticket
  const createTicket = async (columnId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTicketName[columnId], columnId }),
      });
      if (!response.ok) {
        throw new Error('Error creating ticket');
      }
      const newTicket = await response.json();
      // Update column state by adding a new ticket to the right column
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column._id === columnId ? { ...column, tickets: [...column.tickets, newTicket.newTicket] } : column
        )
      );

      setNewTicketName('');
    } catch (error) {
      console.log(`Error creating ticket, ${error.message}`);
    }
  };

  // Delete column
  const deleteColumn = async (columnId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Error deleting column');
      }
      setColumns((prevColumns) => prevColumns.filter((column) => column._id !== columnId));
    } catch (error) {
      console.log(`Error deleting column, ${error.message}`);
    }
  };
  
  // Delete ticket
  const deleteTicket = async (ticketId: string, columnId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Error deleting ticket');
      }
      // Update column state by removing a ticket from the right column
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column._id === columnId
            ? { ...column, tickets: column.tickets.filter((ticket) => ticket._id !== ticketId) }
            : column
        )
      );
    } catch (error) {
      console.log(`Error deleting ticket, ${error.message}`);
    }
  };

  // TicketNameChange is called when input field is changed
  // Updates the newTicketName state with the tickets name for a specific column, removes issue with all ticket text field states changing at the same time
  const TicketNameChange = (columnId: string, name: string) => {
    setNewTicketName((prev) => ({ ...prev, [columnId]: name }));
  };

  // Defines drag and drop and error handling
  const handleDragnAndDrop = (results) => {
    const { source, destination, draggableId, type } = results;

    //error handling for non valid destination and same location
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Drag and drop for columns
    if (type === "group") {
      const reorderColumns = [...columns];
      const [removedColumn] = reorderColumns.splice(source.index, 1);
      reorderColumns.splice(destination.index,0, removedColumn);
      setColumns(reorderColumns);
    }
    // Drag and drop for tickets
    // Find destination and source columns by ID's
    const destinationColumnIndex = columns.findIndex((column) => column._id === destination.droppableId);
    const sourceColumnIndex = columns.findIndex((column) => column._id === source.droppableId);
    const destinationColumn = columns[destinationColumnIndex];
    const sourceColumn = columns[sourceColumnIndex];

    // Find dragged ticket using ID
    const draggedTicket = sourceColumn.tickets.find((ticket) => ticket._id === draggableId);
    const newSourceTickets = sourceColumn.tickets;
    newSourceTickets.splice(source.index, 1);

    const newDestinationTicket = destinationColumn.tickets;
    newDestinationTicket.splice(destination.index, 0, draggedTicket); 

    // New columns with updated ticket places
    const newColumns = [...columns];
    newColumns[sourceColumnIndex] = { ...sourceColumn, tickets: newSourceTickets };
    newColumns[destinationColumnIndex] = { ...destinationColumn, tickets: newDestinationTicket };
    
    // Update state with new column and ticket position
    setColumns(newColumns);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', margin: 2 }}>
        <TextField
          label="New column name"
          variant="outlined"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          sx={{ margin: 1, minWidth:"10vh"}}
        />
        <Button sx={{color: "black", fontFamily: "Comfortaa, sans-serif", textTransform: "none"}} onClick={createColumn}> Add a column </Button>
      </Box>
      <DragDropContext onDragEnd={handleDragnAndDrop}>
        <Droppable droppableId="ROOT" type="group" direction="horizontal">
        {(provided) => (
        <Grid container spacing={1} sx={{ flexWrap: "nowrap", overflowX: "auto", display:"flex"}}{...provided.droppableProps} ref={provided.innerRef}>
          {columns.map((column, index) => (
            <Draggable key={column._id} draggableId={column._id} index={index}>
              {(provided) => (
            <Grid item sx={{ flex: "1 1 auto", maxWidth:"30vh" }} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <Paper
              /*flex-grow 1, flex-shrink 1, flex-basis auto */
                sx={{
                  flex: "1 1 auto",
                  padding: 1,
                  display: 'flex',
                  border: '1px solid red',
                  margin: 1,
                  flexDirection: 'column',
                  minHeight: "60vh",
                  minWidth:"10vh",
                  flexGrow: 1,
                }}
              >
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: 15, fontFamily: "Comfortaa, sans-serif" }}>
                  {column.name}
                </Typography>
                <Button sx={{color: "black",fontSize: 10,border: "1px dotted red ", fontFamily: "Comfortaa, sans-serif", textTransform: "none"}} onClick={() => deleteColumn(column._id)}> Delete Column </Button>
                <Droppable droppableId={column._id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      style={{ flexGrow: 1, overflowY: 'auto', padding: 5 }}
                    >
                      {(column.tickets || []).map((ticket, index) => (
                        <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              key={ticket._id}
                              sx={{
                                padding: 1,
                                border: '1px solid Black',
                                marginBottom: 1,
                              }}
                            >
                              <Typography sx={{ fontSize: 15, width: "100%", fontWeight: "bold"}}>{ticket.name}</Typography>
                                <Paper sx={{border: "1px dotted black"}}>
                                    <Typography sx={{ fontSize: 12, padding: 1 }}>Task will be specified under here</Typography>
                                </Paper>
                              <IconButton
                                onClick={() => deleteTicket(ticket._id, column._id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <TextField
                  label="New ticket"
                  variant="outlined"
                  value={newTicketName[column._id] || ''}
                  onChange={(e) => TicketNameChange(column._id, e.target.value)}
                  sx={{ margin: 1 }}
                />
                <IconButton onClick={() => createTicket(column._id)}>  <AddIcon/></IconButton>
              </Paper>
            </Grid>
          )}
        </Draggable>
        ))}
        {provided.placeholder}
      </Grid>
      )}
      </Droppable>
    </DragDropContext>
  </div>
);
}
export default Kanban;
